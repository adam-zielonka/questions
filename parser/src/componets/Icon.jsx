import React from 'react'

const paths = {
  parse: <path d="m8 5-7 7 7 7m8-14 7 7-7 7M14 3l-4 18" />,
  download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
  folder: <path d="M3 8V5h6l2 3h10v3M3 8h6l2 3h11l-3 9H3V8Z" />,
}

export default function Icon({ name }) {
  return <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {paths[name]}
  </svg>
}
