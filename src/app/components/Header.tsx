'use client'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const COOKIE_KEY = 'cwa_active_menu';
const STUDENT_NUMBER = '22586621';

function setCookie(name: string, value: string, days = 7) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;expires=${d.toUTCString()}`;
}
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export default function Header(){
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(()=> {
    const c = getCookie(COOKIE_KEY);
    if (c) setActiveMenu(c);
    const t = localStorage.getItem('cwa_theme_v1') as 'light'|'dark'|null;
    if(t) setTheme(t);
  },[])

  useEffect(()=> {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cwa_theme_v1', theme);
  },[theme])

  const nav = [
    {label:'Home', href:'/'},
    {label:'Tabs', href:'/tabs'},
    {label:'About', href:'/about'},
  ];

  return (
    <header className="header" role="banner" aria-label="Main header">
      {/* LEFT SECTION */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
        <span style={{fontSize:12, color:'var(--muted)'}}>{STUDENT_NUMBER}</span>
        <strong style={{fontSize:18, marginTop:2}}>CWA - Assignment 1</strong>
      </div>

      {/* RIGHT SECTION */}
      <nav aria-label="Primary" style={{display:'flex', alignItems:'center', gap:12}}>
        <div style={{display:'flex', gap:8}}>
          {nav.map(i => (
            <Link
              key={i.href}
              href={i.href}
              style={{
                textDecoration: 'none',
                color: 'var(--text)',
                opacity: activeMenu === i.href ? 1 : 0.8
              }}
              aria-current={activeMenu === i.href ? 'page' : undefined}
              onClick={() => { 
                setCookie(COOKIE_KEY, i.href); 
                setActiveMenu(i.href); 
              }}
            >
              {i.label}
            </Link>
          ))}
        </div>

        <button
          className="hamburger"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={()=> setOpen(v=>!v)}
        >
          <span className="bars" />
        </button>

        <button
          onClick={()=> setTheme(t => t === 'light' ? 'dark' : 'light')}
          aria-label="Toggle theme"
          style={{border:'1px solid rgba(0,0,0,0.06)', padding:'6px 8px', borderRadius:8, background:'transparent'}}
        >
          {theme === 'light' ? '🌞' : '🌙'}
        </button>
      </nav>
    </header>
  )
}
