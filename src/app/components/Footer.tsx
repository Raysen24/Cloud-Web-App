'use client'
import React from 'react';

export default function Footer(){
  const name = 'Winata Aditya Raysen Susanto';
  const student = '22586621';
  const date = new Date().toLocaleDateString();

  return (
    <footer className="footer" role="contentinfo">
      © {new Date().getFullYear()} {name} - {student} - {date}
    </footer>
  );
}
