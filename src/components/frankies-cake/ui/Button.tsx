'use client';

import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

type CommonProps = {
  children: React.ReactNode;
  variant?: 'solid' | 'outline' | 'ghost' | 'invert';
  size?: 'md' | 'lg';
  className?: string;
  showArrow?: boolean;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
};

type ButtonAsLink = CommonProps & {
  href: string;
  onClick?: () => void;
};

const base =
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap font-medium tracking-wide transition-colors duration-300';

const sizes = {
  md: 'h-12 px-6 text-[13px]',
  lg: 'h-14 px-8 text-sm',
};

const variants = {
  solid: 'bg-fc-cocoa text-fc-cream',
  outline: 'border border-fc-cocoa/30 text-fc-cocoa hover:border-fc-cocoa',
  ghost: 'text-fc-cocoa hover:text-fc-gold',
  invert: 'bg-fc-cream text-fc-cocoa',
};

function Fill({ variant }: { variant: NonNullable<CommonProps['variant']> }) {
  if (variant === 'ghost') return null;
  return (
    <span
      aria-hidden
      className={`absolute inset-0 -z-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${
        variant === 'solid' || variant === 'invert' ? 'bg-fc-gold' : 'bg-fc-cocoa'
      }`}
    />
  );
}

function Label({
  children,
  variant,
  showArrow,
}: {
  children: React.ReactNode;
  variant: NonNullable<CommonProps['variant']>;
  showArrow?: boolean;
}) {
  return (
    <span
      className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${
        variant === 'outline' ? 'group-hover:text-fc-cream' : ''
      }`}
    >
      {children}
      {showArrow ? (
        <ArrowUpRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={1.75}
        />
      ) : null}
    </span>
  );
}

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { children, variant = 'solid', size = 'md', className = '', showArrow } = props;
  const classes = `${base} ${sizes[size]} ${variants[variant]} ${
    variant === 'solid' || variant === 'invert' ? 'shadow-[0_10px_30px_-12px_rgba(58,42,32,0.55)]' : ''
  } ${className}`;

  if ('href' in props && props.href) {
    return (
      <motion.a
        href={props.href}
        onClick={props.onClick}
        whileTap={{ scale: 0.97 }}
        className={classes}
      >
        <Fill variant={variant} />
        <Label variant={variant} showArrow={showArrow}>
          {children}
        </Label>
      </motion.a>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <motion.button
      type={buttonProps.type ?? 'button'}
      onClick={buttonProps.onClick}
      disabled={buttonProps.disabled}
      whileTap={{ scale: 0.97 }}
      className={`${classes} disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <Fill variant={variant} />
      <Label variant={variant} showArrow={showArrow}>
        {children}
      </Label>
    </motion.button>
  );
}
