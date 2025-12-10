// components/Section.tsx
import React from "react";
import Container from "@/components/altre/container";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <Container>
      <h2 className="text-2xl font-bold pt-2">{title}</h2>
      {children}
    </Container>
  );
};

export default Section;
