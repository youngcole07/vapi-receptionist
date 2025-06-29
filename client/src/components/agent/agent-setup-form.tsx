import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Info, Phone, Save } from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface User {
  greetingMessage?: string;
  serviceList?: string[];
  preferredVoice?: string;
  faqs?: FAQ[];
  primaryPhone?: string;
  backupDelay?: number;
}

interface AgentSetupFormProps {
  user: User | null;
  onSubmit: (data: any) => void;
  onTest: () => void;
  isSubmitting: boolean;
  isTesting: boolean;
}

const voices = [
  { value: "Rachel", label: "Rachel (Female, Professional)" },
  { value: "Daniel", label: "Daniel (Male, Friendly)" },
  { value: "Emma", label: "Emma (Female, Warm)" },
  { value: "Brian", label: "Brian (Male, Professional)" },
];

export default function AgentSetupForm({ 
  user, 
  onSubmit, 
  onTest, 
  isSubmitting, 
  isTesting 
}: AgentSetupFormProps) {
  const [greetingMessage, setGreetingMessage] = useState("");
  const [serviceInput, setServiceInput] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [preferredVoice, setPreferredVoice] = useState("Rachel");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [backupDelay, setBackupDelay] = useState("30");
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (user) {
      setGreetingMessage(user.greetingMessage || "Hi, thanks for calling! How can I help you today?");
      setServices(user.serviceList || []);
      setPreferredVoice(user.preferredVoice || "Rachel");
      setPrimaryPhone(user.primaryPhone || "");
      setBackupDelay((user.backupDelay || 30).toString());
      setFaqs(user.faqs || []);
    }
  }, [user]);

  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const removeService = (service: string) => {
    setServices(services.filter(s => s !== service));
  };

  const addFAQ = () => {
    setFaqs([...faqs, { question: "", answer: "" }]);
  };

  const updateFAQ = (index: number, field: "question" | "answer", value: string) => {
    const updatedFaqs = faqs.map((faq, i) => 
      i === index ? { ...faq, [field]: value } : faq
    );
    setFaqs(updatedFaqs);
  };

  const removeFAQ = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      greetingMessage,
      serviceList: services,
      preferredVoice,
      primaryPhone,
      backupDelay: parseInt(backupDelay),
      faqs: faqs.filter(faq => faq.question.trim() && faq.answer.trim()),
    });
  };

  return (
    <Card className="border border-slate-200">
      <CardHeader className="border-b border-slate-200">
        <CardTitle>AI Agent Configuration</CardTitle>
        <p className="text-sm text-slate-600 mt-1">
          Customize your AI receptionist's behavior and responses
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="greeting-message">Greeting Message</Label>
                <Textarea
                  id="greeting-message"
                  rows={3}
                  value={greetingMessage}
                  onChange={(e) => setGreetingMessage(e.target.value)}
                  placeholder="Hi, thanks for calling! How can I help you today?"
                  className="resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred-voice">AI Voice</Label>
                <Select value={preferredVoice} onValueChange={setPreferredVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.value} value={voice.value}>
                        {voice.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              <Label>Services Offered</Label>
              <div className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                <Input
                  placeholder="e.g., Carpet Cleaning, Window Washing"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
                  className="border-0 focus-visible:ring-0 p-0"
                />
                <Button type="button" onClick={addService} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Service Tags */}
              {services.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {services.map((service) => (
                    <Badge key={service} variant="secondary" className="bg-primary/10 text-primary">
                      {service}
                      <Button
                        type="button"
                        onClick={() => removeService(service)}
                        variant="ghost"
                        size="sm"
                        className="ml-2 h-auto p-0 text-primary/60 hover:text-primary"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* FAQ Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Frequently Asked Questions</Label>
                <Button type="button" onClick={addFAQ} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add FAQ
                </Button>
              </div>
              
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Question</Label>
                        <Input
                          placeholder="Enter question"
                          value={faq.question}
                          onChange={(e) => updateFAQ(index, "question", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Answer</Label>
                        <Textarea
                          rows={2}
                          placeholder="Enter answer"
                          value={faq.answer}
                          onChange={(e) => updateFAQ(index, "answer", e.target.value)}
                          className="resize-none"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button
                        type="button"
                        onClick={() => removeFAQ(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call Routing Settings */}
            <div className="border-t border-slate-200 pt-6">
              <h4 className="text-lg font-medium text-slate-900 mb-4">Call Routing Settings</h4>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h5 className="font-medium text-blue-900">How it works</h5>
                    <p className="text-sm text-blue-700 mt-1">
                      Calls first go to your primary number. If you don't answer or decline, 
                      the AI receptionist automatically handles the call and captures the lead.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary-phone">Your Primary Phone Number</Label>
                  <Input
                    id="primary-phone"
                    type="tel"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="+1 (412) 555-6789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-delay">AI Backup Delay</Label>
                  <Select value={backupDelay} onValueChange={setBackupDelay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="45">45 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <div className="flex items-center text-sm text-slate-600">
                <Save className="h-4 w-4 mr-2" />
                Changes are automatically saved
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={onTest}
                  variant="outline"
                  disabled={isTesting}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  {isTesting ? "Testing..." : "Test Call"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary-dark"
                >
                  {isSubmitting ? "Updating..." : "Update Agent"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
