import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield } from "lucide-react";

interface CibilFormProps {
  onSubmit: (data: { name: string; pan: string; email: string }) => void;
  isLoading: boolean;
}

export function CibilForm({ onSubmit, isLoading }: CibilFormProps) {
  const [name, setName] = useState("");
  const [pan, setPan] = useState("");
  const [email, setEmail] = useState("");
  const [panError, setPanError] = useState("");

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const upperPan = pan.toUpperCase();
    if (!panRegex.test(upperPan)) {
      setPanError("Enter a valid PAN (e.g., ABCDE1234F)");
      return;
    }
    setPanError("");
    onSubmit({ name, pan: upperPan, email });
  };

  return (
    <Card className="w-full max-w-md border-brand/20 shadow-brand">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
          <Shield className="h-7 w-7 text-brand" />
        </div>
        <CardTitle className="text-2xl font-heading text-foreground">
          Check Your CIBIL Score
        </CardTitle>
        <CardDescription>
          Enter your details to fetch your credit score instantly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pan">PAN Card Number</Label>
            <Input
              id="pan"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={(e) => {
                setPan(e.target.value.toUpperCase());
                setPanError("");
              }}
              required
              maxLength={10}
              className={panError ? "border-destructive" : ""}
            />
            {panError && (
              <p className="text-sm text-destructive">{panError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-brand hover:bg-brand-dark text-brand-foreground"
            disabled={isLoading}
          >
            {isLoading ? "Checking…" : "Check CIBIL Score"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
