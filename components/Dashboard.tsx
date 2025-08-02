"use client";

import { useState, useEffect } from "react";
import { Home, DollarSign, Users, TrendingUp, Eye, MessageSquare, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCard {
	label: string;
	value: string;
	change: string;
	isPositive: boolean;
	icon: any;
	color: string;
}

interface Property {
	id: number;
	title: string;
	address: string;
	neighborhood: string;
	price: number;
	currency: string;
	type: string;
	operation: string;
	status: string;
	views: number;
	leads: number;
	createdAt: string;
	featured: boolean;
}

const Dashboard = () => {
	const [stats, setStats] = useState<StatCard[]>([
		{
			label: "Propiedades Activas",
			value: "23",
			change: "+2 esta semana",
			isPositive: true,
			icon: Home,
			color: "bg-blue-500"
		},
		{
			label: "Ventas del Mes",
			value: "$145.000",
			change: "+15% vs mes anterior",
			isPositive: true,
			icon: DollarSign,
			color: "bg-green-500"
		},
		{
			label: "Leads Nuevos",
			value: "47",
			change: "+8 hoy",
			isPositive: true,
			icon: Users,
			color: "bg-purple-500"
		},
		{
			label: "Visitas Totales",
			value: "1.247",
			change: "+23% esta semana",
			isPositive: true,
			icon: TrendingUp,
			color: "bg-orange-500"
		}
	]);

	const [recentProperties, setRecentProperties] = useState<Property[]>([
		{
			id: 1,
			title: "Casa familiar en Barrio Parque",
			address: "Belgrano 1234",
			neighborhood: "Barrio Parque",
			price: 75000,
			currency: "USD",
			type: "Casa",
			operation: "Venta",
			status: "Disponible",
			views: 127,
			leads: 8,
			createdAt: "2024-06-15",
			featured: true
		},
		{
			id: 2,
			title: "Terreno céntrico 10x18",
			address: "San Martín 567",
			neighborhood: "Centro",
			price: 48000,
			currency: "USD",
			type: "Terreno",
			operation: "Venta",
			status: "Disponible",
			views: 89,
			leads: 12,
			createdAt: "2024-06-10",
			featured: true
		},
		{
			id: 3,
			title: "Departamento luminoso",
			address: "Moreno 890",
			neighborhood: "Barrio Lorenzón",
			price: 200000,
			currency: "ARS",
			type: "Departamento",
			operation: "Alquiler",
			status: "Disponible",
			views: 45,
			leads: 5,
			createdAt: "2024-06-01",
			featured: false
		}
	]);

	const [recentActivity] = useState([
		{ id: 1, type: "lead", message: "Nuevo contacto para Casa en Barrio Parque", time: "5 min ago" },
		{ id: 2, type: "property", message: "Propiedad actualizada: Terreno céntrico", time: "1 hora ago" },
		{ id: 3, type: "lead", message: "Consulta sobre departamento en Lorenzón", time: "2 horas ago" },
		{ id: 4, type: "sale", message: "Venta confirmada: Casa en 314 Viviendas", time: "1 día ago" }
	]);

	// Simular carga de datos desde API
	useEffect(() => {
		// Aquí iría la llamada a la API para obtener datos reales
		// fetchDashboardData()
	}, []);

	const formatCurrency = (amount: number, currency: string) => {
		return `$${amount.toLocaleString()} ${currency}`;
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Disponible":
				return "bg-green-100 text-green-800";
			case "Vendido":
				return "bg-red-100 text-red-800";
			case "Alquilado":
				return "bg-blue-100 text-blue-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getActivityIcon = (type: string) => {
		switch (type) {
			case "lead":
				return <MessageSquare className="w-4 h-4 text-blue-500" />;
			case "property":
				return <Home className="w-4 h-4 text-green-500" />;
			case "sale":
				return <DollarSign className="w-4 h-4 text-orange-500" />;
			default:
				return <Calendar className="w-4 h-4 text-gray-500" />;
		}
	};

	return (
		<div className="space-y-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{stats.map((stat, index) => (
					<div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-gray-600">{stat.label}</p>
								<p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
								<div className="flex items-center mt-2">
									{stat.isPositive ? (
										<ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
									) : (
										<ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
									)}
									<p className={`text-sm ${stat.isPositive ? "text-green-600" : "text-red-600"}`}>{stat.change}</p>
								</div>
							</div>
							<div className={`${stat.color} p-3 rounded-lg`}>
								<stat.icon className="w-6 h-6 text-white" />
							</div>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Propiedades Recientes */}
				<div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<div className="flex items-center justify-between">
							<h2 className="text-xl font-semibold text-gray-900">Propiedades Recientes</h2>
							<button className="text-orange-500 hover:text-orange-600 font-medium text-sm">Ver todas</button>
						</div>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{recentProperties.map(property => (
								<div
									key={property.id}
									className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
									<div className="flex items-center space-x-4">
										<div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
											<Home className="w-8 h-8 text-gray-400" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
											<p className="text-sm text-gray-500">
												{property.address}, {property.neighborhood}
											</p>
											<div className="flex items-center space-x-4 mt-1">
												<p className="text-sm font-medium text-orange-600">{formatCurrency(property.price, property.currency)}</p>
												<span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
													{property.status}
												</span>
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="flex items-center space-x-4 text-sm text-gray-500">
											<span className="flex items-center">
												<Eye className="w-4 h-4 mr-1" />
												{property.views}
											</span>
											<span className="flex items-center">
												<MessageSquare className="w-4 h-4 mr-1" />
												{property.leads}
											</span>
										</div>
										<p className="text-xs text-gray-400 mt-1">{property.createdAt}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Actividad Reciente */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">Actividad Reciente</h2>
					</div>
					<div className="p-6">
						<div className="space-y-4">
							{recentActivity.map(activity => (
								<div key={activity.id} className="flex items-start space-x-3">
									<div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm text-gray-900">{activity.message}</p>
										<p className="text-xs text-gray-500 mt-1">{activity.time}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
				<h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
						<Home className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
						<span className="text-gray-600 group-hover:text-orange-600 font-medium">Nueva Propiedad</span>
					</button>
					<button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
						<MessageSquare className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
						<span className="text-gray-600 group-hover:text-orange-600 font-medium">Ver Contactos</span>
					</button>
					<button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors group">
						<TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
						<span className="text-gray-600 group-hover:text-orange-600 font-medium">Ver Reportes</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
