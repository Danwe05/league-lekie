import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <h1 className="font-heading font-bold text-4xl uppercase tracking-tighter mb-8 border-b-4 border-primary inline-block pb-2">
        Contactez-Nous
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <Card className="border-border shadow-none rounded-xl h-full">
            <CardContent className="p-8 flex flex-col gap-8 justify-center h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-xl text-primary shrink-0 border border-border">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-lg font-heading tracking-tight">Siège</h3>
                  <p className="text-muted-foreground font-medium">Stade Municipal d&apos;Obala<br/>BP 123, Obala<br/>Cameroun</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-xl text-primary shrink-0 border border-border">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-lg font-heading tracking-tight">Email</h3>
                  <p className="text-muted-foreground font-medium">contact@liguelekie.cm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-xl text-primary shrink-0 border border-border">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1 text-lg font-heading tracking-tight">Téléphone</h3>
                  <p className="text-muted-foreground font-medium">+237 696 66 51 90</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
