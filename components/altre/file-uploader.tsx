'use client';

import React, { Dispatch, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from "next/image";
import { Input } from '../ui/input';

interface FileUploaderProps {
  imageUrl: string;
  onFieldChange: (value: string) => void;
  setFiles: Dispatch<React.SetStateAction<File[]>>;
}

export function FileUploader({ imageUrl, onFieldChange, setFiles }: FileUploaderProps): React.ReactElement {
  const [error, setError] = useState<string | null>(null); // Stato per gestire gli errori

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: unknown[]) => {
      if (fileRejections.length > 0) {
        setError("Formato file non supportato. Seleziona un'immagine valida.");
        return;
      }

      setError(null); // Resetta gli errori
      setFiles(acceptedFiles);

      const file = acceptedFiles[0];
      const fileReader = new FileReader();

      // Genera un'anteprima dell'immagine caricata
      fileReader.onload = () => {
        const previewUrl = fileReader.result as string;
        onFieldChange(previewUrl);
      };

      fileReader.readAsDataURL(file);
    },
    [setFiles, onFieldChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/svg+xml': ['.svg'],
    },
  });

  const handleRemoveImage = () => {
    onFieldChange(""); // Resetta l'URL dell'immagine
    setFiles([]); // Svuota i file caricati
  };

  return (
    <div className="flex flex-col items-center">
      {!imageUrl ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed p-5 rounded-lg text-center cursor-pointer transition-all duration-200 ${
            isDragActive ? 'border-blue-500 bg-blue-100' : 'border-gray-300 bg-gray-50'
          } hover:bg-gray-100`}
        >
          <Input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-blue-500 font-medium">Rilascia l&apos;immagine qui...</p>
          ) : (
            <p className="text-gray-600">Trascina un&apos;immagine qui o clicca per selezionarla</p>
          )}
        </div>
      ) : (
        <div className="relative flex h-full w-full flex-1 justify-center">
          <Image
            src={imageUrl}
            width={250}
            height={250}
            alt="Anteprima"
            className="w-full object-cover object-center"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
          >
            X
          </button>
        </div>
      )}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
