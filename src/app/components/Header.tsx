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
    {label:'Escape Room', href:'/escape-room'},
    {label:'Coding Races', href:'/coding-races'},
    {label:'Court Room', href:'/court-room'},
  ];

  return (
    <>
      <header className="header" role="banner" aria-label="Main header" 
        style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        
        {/* LEFT SECTION with Hamburger */}
        <div style={{display:'flex', alignItems:'center', gap:12, position:'relative', zIndex:110}}>
          <button
            className="hamburger"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={()=> setOpen(v=>!v)}
            style={{
              border:'none',
              background:'transparent',
              cursor:'pointer',
              fontSize:20,
              zIndex:110, // 👈 ensures it stays above the sidebar
              position:'relative'
            }}
          >
            ☰
          </button>

          <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
            <span style={{fontSize:12, color:'var(--muted)'}}>Student ID: {STUDENT_NUMBER}</span>
            <strong style={{fontSize:18, marginTop:2}}>CWA - Assignment 1</strong>
          </div>
        </div>


        {/* MIDDLE SECTION - NAV */}
        <nav aria-label="Primary" style={{flex:1, display:'flex', justifyContent:'center'}}>
          <div style={{display:'flex', gap:16}}>
            {nav.map(i => (
              <Link
                key={i.href}
                href={i.href}
                style={{
                  textDecoration: 'none',
                  color: 'var(--text)',
                  opacity: activeMenu === i.href ? 1 : 0.8,
                  fontWeight: activeMenu === i.href ? 'bold' : 'normal'
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
        </nav>

        {/* RIGHT SECTION - Theme Toggle */}
        <div>
          <button
            onClick={()=> setTheme(t => t === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            style={{border:'1px solid rgba(0,0,0,0.06)', padding:'6px 8px', borderRadius:8, background:'transparent'}}
          >
            {theme === 'light' ? '🌞' : '🌙'}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {open && (
        <div 
          onClick={()=> setOpen(false)} 
          style={{
            position:'fixed',
            top:'60px', // 👈 start below header
            left:0,
            right:0,
            bottom:0, 
            background:'rgba(0,0,0,0.5)', 
            zIndex:99
          }}
        />
      )}

      {/* Sidebar Menu */}
      <aside
        style={{
          position:'fixed',
          top:'60px', // 👈 start below header
          left: open ? 0 : '-250px',
          height:'calc(100% - 60px)', // 👈 fill remaining space
          width:'250px',
          background:'var(--bg)',
          padding:20,
          boxShadow:'2px 0 6px rgba(0,0,0,0.2)',
          transition:'left 0.3s ease',
          zIndex:100, // below hamburger, above content
        }}
      >
        <h3 style={{marginTop:0}}>Menu</h3>
        <ul style={{listStyle:'none', padding:0}}>
          {nav.map(i => (
            <li key={i.href} style={{marginBottom:12}}>
              <Link
                href={i.href}
                style={{
                  textDecoration:'none',
                  color:'var(--text)',
                  fontWeight: activeMenu === i.href ? 'bold' : 'normal'
                }}
                onClick={() => {
                  setCookie(COOKIE_KEY, i.href);
                  setActiveMenu(i.href);
                  setOpen(false);
                }}
              >
                {i.label}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
