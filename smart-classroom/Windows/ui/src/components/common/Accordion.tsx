import React, { useState } from "react";
import "../../assets/css/Accordion.css";
import Icon from "./Icon";
interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => setIsOpen(!isOpen);

  return (
    <div className="accordion">
      <div className="accordion-header" onClick={toggleAccordion}>
        <h3>{title}</h3>
        <button className="accordion-toggle" aria-label={isOpen ? "Collapse" : "Expand"} aria-expanded={isOpen}>
          <Icon name="chevron" />
        </button>
      </div>
      {isOpen && <div className="accordion-content">{children}</div>}
    </div>
  );
};

export default Accordion;