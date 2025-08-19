"use client";
import React from "react";

const Skeleton = ({ width, height, circle = false, className = "", style }) => {
  const styles = {
    width,
    height,
    borderRadius: circle ? "50%" : "8px",
    ...style, // merge extra styles
  };

  return <div className={`skeleton ${className}`} style={styles}></div>;
};

export default Skeleton;

