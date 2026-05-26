import React, { useState, ReactNode, CSSProperties } from 'react';

interface BackgroundImageContainerProps {
  imageUrl?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  blankStyle?: CSSProperties;
}

/**
 * BackgroundImageContainer - Handles background image loading with blank state
 * 
 * Shows blank space while loading, displays background image when loaded,
 * and keeps blank if loading fails (no broken image placeholder)
 */
export const BackgroundImageContainer: React.FC<BackgroundImageContainerProps> = ({
  imageUrl,
  children,
  className = '',
  style = {},
  blankStyle = {},
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // If no image URL, just render children with blank style
  if (!imageUrl) {
    return (
      <div className={className} style={{ ...blankStyle, ...style }}>
        {children}
      </div>
    );
  }

  return (
    <>
      {/* Hidden image to detect if background image loads successfully */}
      <img
        src={imageUrl}
        alt=""
        style={{ display: 'none' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />

      {/* Show background image only when loaded */}
      {imageLoaded && (
        <div
          className={className}
          style={{
            backgroundImage: `url(${imageUrl})`,
            ...style,
          }}
        >
          {children}
        </div>
      )}

      {/* Show blank space while loading or if loading failed */}
      {!imageLoaded && (
        <div className={className} style={{ ...blankStyle, ...style }}>
          {children}
        </div>
      )}
    </>
  );
};

export default BackgroundImageContainer;
