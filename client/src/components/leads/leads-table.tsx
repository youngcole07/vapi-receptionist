import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageSquare, Star, StarOff, Users } from "lucide-react";

interface Lead {
  id: number;
  name: string;
  phone: string;
  service: string;
  zipCode: string;
  preferredTime: string;
  recordingPath: string;
  isFavorite: boolean;
  createdAt: string;
}

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  onFavorite: (leadId: number, isFavorite: boolean) => void;
}

export default function LeadsTable({ leads, isLoading, onFavorite }: LeadsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading leads...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-slate-200">
          <CardTitle>All Leads</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No leads found</p>
            <p className="text-sm text-slate-400">Leads will appear here when your AI handles calls</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-slate-200">
        <CardTitle>All Leads</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Preferred Time
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Recording
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-900">{lead.name}</p>
                      <p className="text-sm text-slate-600">{lead.phone}</p>
                      {lead.zipCode && (
                        <p className="text-sm text-slate-600">ZIP: {lead.zipCode}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.service && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {lead.service}
                      </Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">{lead.preferredTime || "Not specified"}</p>
                  </td>
                  <td className="px-6 py-4">
                    {lead.recordingPath ? (
                      <audio controls className="w-48 h-8">
                        <source src={`/api${lead.recordingPath}`} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span className="text-sm text-slate-400">No recording</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(lead.createdAt).toLocaleTimeString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${lead.phone}`)}
                        className="text-primary hover:text-primary-dark p-1"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`sms:${lead.phone}`)}
                        className="text-accent hover:text-accent/80 p-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onFavorite(lead.id, !lead.isFavorite)}
                        className={`p-1 ${
                          lead.isFavorite 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-slate-400 hover:text-yellow-500"
                        }`}
                      >
                        {lead.isFavorite ? (
                          <Star className="h-4 w-4 fill-current" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
