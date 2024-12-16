import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, MessageSquare, Send, MapPin, Phone } from "lucide-react";

export const Contact = () => {
  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-[#87CEEB]" />,
      title: "Email",
      details: "hi@plj.co.ke",
      link: "mailto:hi@plj.co.ke"
    },
    {
      icon: <Phone className="w-5 h-5 text-[#87CEEB]" />,
      title: "Phone",
      details: "+254 712 345 678",
      link: "tel:+254712345678"
    },
    {
      icon: <MapPin className="w-5 h-5 text-[#87CEEB]" />,
      title: "Location",
      details: "Nairobi, Kenya",
      link: "#"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(135,206,235,0.1),transparent)] z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold font-sans mb-6 text-[#2B4C7E]">
            Get in Touch
          </h2>
          <p className="text-[#2B4C7E]/80 text-lg font-medium">
            Have questions or want to be featured on our podcast? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information Cards */}
          <div className="flex flex-col justify-between h-full ">
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <a 
                  href={info.link}
                  key={index}
                  className="block group"
                >
                  <Card className="bg-white shadow hover:shadow-md p-4 border-2 border-l-[#87CEEB] border-t-0 border-r-0 border-b-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-[#87CEEB]/10 p-2 rounded-lg">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="text-[#2B4C7E] font-medium mb-0.5">{info.title}</h3>
                        <p className="text-[#2B4C7E]/70 text-sm">{info.details}</p>
                      </div>
                    </div>
                  </Card>
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[#2B4C7E]/60 mt-4 text-sm">
              <MessageSquare className="w-4 h-4" />
              <p>We typically respond within 24 hours</p>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="bg-white shadow p-6">
            <form className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#2B4C7E] mb-1.5 block">Name</label>
                  <Input 
                    placeholder="Your Name" 
                    className="bg-white border-[#E5E7EB] text-[#2B4C7E] placeholder:text-[#2B4C7E]/40 focus:border-[#87CEEB]"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#2B4C7E] mb-1.5 block">Email</label>
                  <Input 
                    type="email" 
                    placeholder="Your Email" 
                    className="bg-white border-[#E5E7EB] text-[#2B4C7E] placeholder:text-[#2B4C7E]/40 focus:border-[#87CEEB]"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-[#2B4C7E] mb-1.5 block">Subject</label>
                <Input 
                  placeholder="Message Subject" 
                  className="bg-white border-[#E5E7EB] text-[#2B4C7E] placeholder:text-[#2B4C7E]/40 focus:border-[#87CEEB]"
                />
              </div>

              <div>
                <label className="text-sm text-[#2B4C7E] mb-1.5 block">Message</label>
                <Textarea 
                  placeholder="Your Message" 
                  className="bg-white border-[#E5E7EB] text-[#2B4C7E] placeholder:text-[#2B4C7E]/40 focus:border-[#87CEEB] min-h-[120px] resize-none"
                />
              </div>

              <Button 
                className="w-full bg-[#2B4C7E] hover:bg-[#2B4C7E]/90 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};