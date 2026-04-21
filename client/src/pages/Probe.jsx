import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Probe() {
  return (
    <div className="min-h-screen bg-background p-10 text-foreground">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold text-primary">
          Tailwind + shadcn working
        </h1>
        <p className="text-muted-foreground">
          If you see Inter font, blue heading, dark background, and a proper
          card below, the setup is correct.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>Card renders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <div className="flex gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
