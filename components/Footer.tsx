import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Peak Life Journey</h3>
            <p className="text-white/80">
              Empowering you to reach your peak potential through inspiring conversations and evidence-based insights.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#episodes" className="text-white/80 hover:text-white">Episodes</a></li>
              <li><a href="#about" className="text-white/80 hover:text-white">About</a></li>
              <li><a href="#guests" className="text-white/80 hover:text-white">Guests</a></li>
              <li><a href="#contact" className="text-white/80 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-white/80 hover:text-white">
                <Facebook size={24} />
              </a>
              <a href="#" className="text-white/80 hover:text-white">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-white/80 hover:text-white">
                <Instagram size={24} />
              </a>
              <a href="#" className="text-white/80 hover:text-white">
                <Youtube size={24} />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-white/60">
          <p>&copy; {new Date().getFullYear()} Peak Life Journey. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};