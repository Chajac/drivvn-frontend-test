import React from "react";

interface CardProps {
	cardImage: string;
	alt?: string;
	className?: string;
}

const Card: React.FC<CardProps> = ({ cardImage, alt, className }) => {
	return (
		<img
			src={cardImage}
			alt={alt}
			className={`w-full h-full ${className}`}
		/>
	);
};

export default Card;
