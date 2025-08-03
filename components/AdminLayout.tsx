// app/admin/layout.tsx
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, TrendingUp, MessageSquare, Settings, LogOut, Menu, X } from "lucide-react";

interface AdminLayoutProps {
	children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();

	const navigation = [
		{ name: "Dashboard", href: "/admin", icon: TrendingUp, current: pathname === "/admin" },
		{ name: "Propiedades", href: "/admin/properties", icon: Home, current: pathname.startsWith("/admin/properties") },
		{ name: "Contactos", href: "/admin/contacts", icon: MessageSquare, current: pathname === "/admin/contacts" },
		{ name: "Configuración", href: "/admin/settings", icon: Settings, current: pathname === "/admin/settings" }
	];

	const handleLogout = async () => {
		// Aquí irá la lógica de logout con Supabase
		console.log("Logout...");
		router.push("/admin/login");
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-40 lg:hidden">
					<div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
				</div>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
					sidebarOpen ? "translate-x-0" : "-translate-x-full"
				} lg:static lg:inset-0`}>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 cursor-pointer">
							<div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
								<Home className="w-5 h-5 text-white" />
							</div>
							<div>
								<img 
									src="/assets/logos/marconi_title.svg" 
									alt="Marconi Inmobiliaria" 
									className="h-6 w-auto"
								/>
								<p className="text-xs text-gray-500">Admin Panel</p>
							</div>
						</a>
						<button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-gray-400 hover:text-gray-600">
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-6 py-6 space-y-2">
						{navigation.map(item => (
							<button
								key={item.name}
								onClick={() => {
									router.push(item.href);
									setSidebarOpen(false);
								}}
								className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
									item.current ? "bg-orange-50 text-orange-700 border border-orange-200" : "text-gray-700 hover:bg-gray-100"
								}`}>
								<item.icon className="w-5 h-5" />
								<span className="font-medium">{item.name}</span>
							</button>
						))}
					</nav>

					{/* User Profile */}
					<div className="p-6 border-t border-gray-200">
						<div className="flex items-center space-x-3 mb-3">
							<div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">F</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">Floriana Marconi</p>
								<p className="text-xs text-gray-500">Administrador</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left text-gray-600 hover:bg-gray-100 transition-colors">
							<LogOut className="w-4 h-4" />
							<span className="text-sm">Cerrar Sesión</span>
						</button>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="lg:ml-64 min-h-screen flex flex-col">
				{/* Top Header */}
				<header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
								<Menu className="w-5 h-5" />
							</button>
							<div>
								<h1 className="text-xl lg:text-2xl font-bold text-gray-900">Panel de Administración</h1>
								<p className="text-sm text-gray-600 hidden sm:block">Gestiona tu inmobiliaria desde aquí</p>
							</div>
						</div>
						<div className="flex items-center space-x-4">
							<button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
								<MessageSquare className="w-5 h-5" />
								<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
									3
								</span>
							</button>
							<div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
								<span className="text-white text-sm font-medium">F</span>
							</div>
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 p-4 lg:p-6">{children}</main>
			</div>
		</div>
	);
};

export default AdminLayout;
