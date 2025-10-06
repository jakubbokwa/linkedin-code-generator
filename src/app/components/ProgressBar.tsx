"use client";
import React from "react";

interface ProgressBarProps {
  value: number; // procent 0–100
}

export default function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="lj-progress-wrap">
      <div className="lj-progress-bar" style={{ width: `${value}%` }} />
    </div>
  );
}
