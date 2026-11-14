import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/kit/card";

export function AuthLayout({
  form,
  title,
  description,
  footerText,
}: {
  form: ReactNode;
  title: ReactNode;
  description: ReactNode;
  footerText: ReactNode;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{form}</CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground [&_a]:text-teal-700 [&_a]:underline">
            {footerText}
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
