import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function DocsLogoIcon({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" {...props}>
      <path
        d="M32 4H10c-2.2 0-4 1.8-4 4v32c0 2.2 1.8 4 4 4h28c2.2 0 4-1.8 4-4V16L32 4z"
        fill="#4285F4"
      />
      <path d="M32 4v12h12" fill="#A1C2FA" />
      <path d="M16 24h16v2H16zm0 6h16v2H16zm0 6h10v2H16z" fill="#fff" />
    </svg>
  );
}

export function IconUndo({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.5 8c-2.65 0-5.05 1.05-6.85 2.75L3 7v9h9l-2.62-2.62A7.8 7.8 0 0 1 12.5 10c2.12 0 4.07.82 5.5 2.18l1.42-1.42A9.77 9.77 0 0 0 12.5 8z" />
    </svg>
  );
}

export function IconRedo({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-3.04 0-5.79 1.23-7.78 3.22l1.42 1.42A7.8 7.8 0 0 1 11.5 10c2.12 0 4.07.82 5.5 2.18l-2.5 2.5H22V7l-3.6 3.6z" />
    </svg>
  );
}

export function IconPrint({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
    </svg>
  );
}

export function IconFormatPaint({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M18.37 2.63 14 7l-1.59-1.59a1 1 0 0 0-1.42 0L9 7.99 8 7l-4.37 4.37a2.12 2.12 0 0 0 0 3l5 5c.78.79 2.04.79 2.83 0L22 7.41a2.12 2.12 0 0 0 0-3L18.37 2.63zM13 20c0 .55-.45 1-1 1H7c-1.1 0-2-.9-2-2v-1h8v2z" />
    </svg>
  );
}

export function IconBold({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.69 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H10V6.5zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" />
    </svg>
  );
}

export function IconItalic({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
    </svg>
  );
}

export function IconUnderline({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </svg>
  );
}

export function IconStrike({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-2.48 2.02-4.5 4.5-4.5H14v2h-2.65c-1.38 0-2.5 1.12-2.5 2.5 0 .65.25 1.24.66 1.68l1.52 1.52H6v2h6.24l-5-5zm-.24 6.25v2h8v-2H7z" />
    </svg>
  );
}

export function IconLink({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
    </svg>
  );
}

export function IconImage({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
    </svg>
  );
}

export function IconAlignLeft({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z" />
    </svg>
  );
}

export function IconAlignCenter({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
    </svg>
  );
}

export function IconAlignRight({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
    </svg>
  );
}

export function IconBulletList({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z" />
    </svg>
  );
}

export function IconNumberList({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z" />
    </svg>
  );
}

export function IconQuote({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
    </svg>
  );
}

export function IconSearch({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C8.01 14 6 11.99 6 9.5S8.01 5 10.5 5 15 7.01 15 9.5 12.99 14 10.5 14z" />
    </svg>
  );
}

export function IconMenu({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
    </svg>
  );
}

export function IconStar({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="m12 17.27 6.18 3.73-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
    </svg>
  );
}

export function IconFolder({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

export function IconCloudDone({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
    </svg>
  );
}

export function IconMoreVert({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
    </svg>
  );
}

export function IconBlankDoc({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 48 48" {...props}>
      <rect x="8" y="4" width="32" height="40" rx="2" fill="#fff" stroke="#dadce0" strokeWidth="2" />
      <line x1="14" y1="14" x2="34" y2="14" stroke="#dadce0" strokeWidth="2" />
      <line x1="14" y1="22" x2="34" y2="22" stroke="#dadce0" strokeWidth="2" />
      <line x1="14" y1="30" x2="28" y2="30" stroke="#dadce0" strokeWidth="2" />
    </svg>
  );
}

export function IconChevronDown({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

export function IconViewList({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 14h4v-4H3v4zm0 5h4v-4H3v4zM3 9h4V5H3v4zm5 5h13v-4H8v4zm0 5h13v-4H8v4zM8 5v4h13V5H8z" />
    </svg>
  );
}

export function IconGridView({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z" />
    </svg>
  );
}

export function IconApps({ className, ...props }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
    </svg>
  );
}
