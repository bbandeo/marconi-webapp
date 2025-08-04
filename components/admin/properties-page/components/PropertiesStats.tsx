import { Home, CheckCircle, XCircle, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PropertiesStatsProps {
  stats: {
    total: number;
    available: number;
    sold: number;
    featured: number;
  };
}

export default function PropertiesStats({ stats }: PropertiesStatsProps) {
  const statItems = [
    {
      title: "Total Propiedades",
      value: stats.total,
      icon: Home,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Disponibles",
      value: stats.available,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Vendidas/Alquiladas",
      value: stats.sold,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Destacadas",
      value: stats.featured,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{item.title}</p>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}