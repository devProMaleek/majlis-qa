import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SessionCard({
  title,
  details,
  preview = false,
}: {
  title: string;
  details: string;
  preview?: boolean;
}) {
  return (
    <Card size="sm">
      <CardHeader className="gap-2.5">
        {preview && <Badge variant="success">● Session preview</Badge>}
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{details}</CardDescription>
      </CardHeader>
    </Card>
  );
}
