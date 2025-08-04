import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  const footerLinks = [
    { href: "/propiedades", label: "Propiedades" },
    { href: "/agentes", label: "Agentes" },
  ]

  return (
    <footer className="bg-gray-800 border-t border-gray-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/assets/logos/marconi_title.svg"
                alt="Marconi Inmobiliaria"
                width={140}
                height={45}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-gray-400 mb-4">
              La inmobiliaria líder en Reconquista, comprometida con encontrar el hogar perfecto para cada familia.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-gray-400">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <button 
                  onClick={() => window.open('https://wa.me/5493482123456?text=Hola,%20quiero%20más%20información', '_blank')}
                  className="hover:text-white transition-colors text-left"
                >
                  Contacto
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-gray-400">
              <li>Reconquista, Santa Fe</li>
              <li>+54 9 3482 123456</li>
              <li>info@marconiinmobiliaria.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Marconi Inmobiliaria. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}