import React from "react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "destructive";
    children: React.ReactNode;
}

export function Alert({ variant = "default", className, children, ...props }: AlertProps) {
    const baseStyles = "rounded-md p-4";
    const variantStyles = variant === "destructive" ? "bg-red-100 border-red-400 text-red-900" : "bg-gray-100 border-gray-300 text-gray-900";

    return (
        <div
            className={`${baseStyles} ${variantStyles} ${className || ""}`}
            role="alert"
            {...props}
        >
            {children}
        </div>
    );
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export function AlertTitle({ className, children, ...props }: AlertTitleProps) {
    return (
        <h5 className={`text-sm font-medium ${className || ""}`} {...props}>
            {children}
        </h5>
    );
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode;
}

export function AlertDescription({ className, children, ...props }: AlertDescriptionProps) {
    return (
        <p className={`text-sm ${className || ""}`} {...props}>
            {children}
        </p>
    );
}