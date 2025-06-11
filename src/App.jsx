import React, { useState, useEffect } from "react";
import {
  Plus,
  Download,
  Calculator,
  Eye,
  EyeOff,
  Calendar,
  User,
  Droplets,
  Thermometer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const CheeseFactoryApp = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState("registro");
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({
    tipo: "",
    origen: "",
    fecha: "",
    productor: "",
  });
  const [showRatesEditor, setShowRatesEditor] = useState(false);
  const [formData, setFormData] = useState({
    productor: "",
    tipo: "fria",
    origen: "vaca",
    cantidad: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [debugInfo, setDebugInfo] = useState("");

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    const startOfWeek = new Date(d.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }

  const [selectedWeek, setSelectedWeek] = useState(getStartOfWeek(new Date()));
  const [weeklyRates, setWeeklyRates] = useState([]);
  const [showWeeklyRatesForm, setShowWeeklyRatesForm] = useState(false);
  const [weeklyRateForm, setWeeklyRateForm] = useState({
    fechaInicio: getStartOfWeek(new Date()).toISOString().split("T")[0],
    vaca_fria: "",
    vaca_caliente: "",
    bufala_fria: "",
    bufala_caliente: "",
    observaciones: "",
  });

  function formatWeekRange(startDate) {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);

    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return (
      startDate.toLocaleDateString("es-ES", options) +
      " - " +
      endDate.toLocaleDateString("es-ES", options)
    );
  }

  useEffect(() => {
    const exampleData = [
      {
        id: 1,
        productor: "Granja López",
        tipo: "fria",
        origen: "vaca",
        cantidad: 150,
        fecha: new Date().toISOString().split("T")[0],
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: 2,
        productor: "Finca Rodríguez",
        tipo: "caliente",
        origen: "bufala",
        cantidad: 85,
        fecha: new Date().toISOString().split("T")[0],
        fechaRegistro: new Date().toISOString(),
      },
    ];
    setDeliveries(exampleData);
    setDebugInfo(
      "Sistema inicializado con " + exampleData.length + " entregas"
    );
  }, []);

  const getRateForDate = (fecha, tipo, origen) => {
    const deliveryDate = new Date(fecha);

    const weeklyRate = weeklyRates.find((rate) => {
      const weekStart = new Date(rate.fechaInicio);
      const weekEnd = new Date(rate.fechaInicio);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      return deliveryDate >= weekStart && deliveryDate <= weekEnd;
    });

    if (weeklyRate) {
      const key = origen + "_" + tipo;
      return weeklyRate[key] || 0;
    }

    // Si no hay tarifa semanal, retorna 0
    return 0;
  };

  const handleSubmit = () => {
    setDebugInfo("Procesando nueva entrega...");

    if (!formData.productor.trim()) {
      alert("Por favor, ingrese el nombre del productor");
      return;
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      alert("Por favor, ingrese una cantidad válida");
      return;
    }

    const newDelivery = {
      id: Date.now() + Math.random(),
      productor: formData.productor.trim(),
      tipo: formData.tipo,
      origen: formData.origen,
      cantidad: parseFloat(formData.cantidad),
      fecha: formData.fecha,
      fechaRegistro: new Date().toISOString(),
    };

    setDeliveries((prevDeliveries) => {
      const newDeliveries = [...prevDeliveries, newDelivery];
      setDebugInfo("Total entregas: " + newDeliveries.length);
      return newDeliveries;
    });

    setFormData({
      productor: "",
      tipo: "fria",
      origen: "vaca",
      cantidad: "",
      fecha: new Date().toISOString().split("T")[0],
    });

    setShowForm(false);
    alert(
      "Entrega registrada: " +
        newDelivery.cantidad +
        "L de " +
        newDelivery.productor
    );
  };

  const handleWeeklyRateSubmit = () => {
    const hasValidRate = Object.keys(weeklyRateForm).some(
      (key) =>
        key !== "fechaInicio" &&
        key !== "observaciones" &&
        weeklyRateForm[key] &&
        parseFloat(weeklyRateForm[key]) > 0
    );

    if (!hasValidRate) {
      alert("Por favor, ingrese al menos una tarifa válida");
      return;
    }

    const existingIndex = weeklyRates.findIndex(
      (rate) => rate.fechaInicio === weeklyRateForm.fechaInicio
    );

    const fechaFin = new Date(weeklyRateForm.fechaInicio);
    fechaFin.setDate(fechaFin.getDate() + 6);

    const newWeeklyRate = {
      id: Date.now(),
      fechaInicio: weeklyRateForm.fechaInicio,
      fechaFin: fechaFin.toISOString().split("T")[0],
      vaca_fria: parseFloat(weeklyRateForm.vaca_fria) || 0,
      vaca_caliente: parseFloat(weeklyRateForm.vaca_caliente) || 0,
      bufala_fria: parseFloat(weeklyRateForm.bufala_fria) || 0,
      bufala_caliente: parseFloat(weeklyRateForm.bufala_caliente) || 0,
      observaciones: weeklyRateForm.observaciones.trim(),
      fechaCreacion: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      const updatedRates = [...weeklyRates];
      updatedRates[existingIndex] = newWeeklyRate;
      setWeeklyRates(updatedRates);
      alert("Tarifa semanal actualizada");
    } else {
      const newRates = [...weeklyRates, newWeeklyRate].sort(
        (a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio)
      );
      setWeeklyRates(newRates);
      alert("Tarifa semanal registrada");
    }

    setWeeklyRateForm({
      fechaInicio: getStartOfWeek(new Date()).toISOString().split("T")[0],
      vaca_fria: "",
      vaca_caliente: "",
      bufala_fria: "",
      bufala_caliente: "",
      observaciones: "",
    });

    setShowWeeklyRatesForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleWeeklyRateChange = (field, value) => {
    setWeeklyRateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const setWeekInForm = (weekStart) => {
    setWeeklyRateForm((prev) => ({
      ...prev,
      fechaInicio: weekStart.toISOString().split("T")[0],
    }));
  };

  const getActiveRateForWeek = (weekStart) => {
    return weeklyRates.find(
      (rate) => rate.fechaInicio === weekStart.toISOString().split("T")[0]
    );
  };

  const getFilteredDeliveries = () => {
    return deliveries.filter((delivery) => {
      return (
        (filter.tipo === "" || delivery.tipo === filter.tipo) &&
        (filter.origen === "" || delivery.origen === filter.origen) &&
        (filter.fecha === "" || delivery.fecha === filter.fecha) &&
        (filter.productor === "" ||
          delivery.productor
            .toLowerCase()
            .includes(filter.productor.toLowerCase()))
      );
    });
  };

  const getColdMilkDeliveries = () => {
    return getFilteredDeliveries().filter((d) => d.tipo === "fria");
  };

  const getHotMilkDeliveries = () => {
    return getFilteredDeliveries().filter((d) => d.tipo === "caliente");
  };

  const calculateWeeklyPayments = () => {
    const startOfWeek = new Date(selectedWeek);
    const endOfWeek = new Date(selectedWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const weeklyDeliveries = deliveries.filter((delivery) => {
      const deliveryDate = new Date(delivery.fecha);
      return deliveryDate >= startOfWeek && deliveryDate <= endOfWeek;
    });

    const producerTotals = {};

    weeklyDeliveries.forEach((delivery) => {
      const key = delivery.productor;
      if (!producerTotals[key]) {
        producerTotals[key] = {
          productor: delivery.productor,
          vaca_fria: 0,
          vaca_caliente: 0,
          bufala_fria: 0,
          bufala_caliente: 0,
          totalLitros: 0,
          totalPago: 0,
        };
      }

      const typeKey = delivery.origen + "_" + delivery.tipo;
      const rateForDate = getRateForDate(
        delivery.fecha,
        delivery.tipo,
        delivery.origen
      );
      const paymentAmount = delivery.cantidad * rateForDate;

      producerTotals[key][typeKey] += delivery.cantidad;
      producerTotals[key].totalLitros += delivery.cantidad;
      producerTotals[key].totalPago += paymentAmount;
    });

    return Object.values(producerTotals);
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(selectedWeek);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(getStartOfWeek(new Date()));
  };

  const exportToCSV = () => {
    const headers = ["Fecha", "Productor", "Tipo", "Origen", "Cantidad (L)"];
    const data = getFilteredDeliveries().map((d) => [
      d.fecha,
      d.productor,
      d.tipo === "fria" ? "Fría" : "Caliente",
      d.origen === "vaca" ? "Vaca" : "Búfala",
      d.cantidad,
    ]);

    const csvContent = [headers, ...data]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      "entregas_leche_" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">
            Sistema de Gestión de Entregas de Leche
          </h1>
          <p className="text-blue-100 mt-2">Quesería - Control de Producción</p>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {[
              { id: "registro", label: "Registro de Entregas", icon: Plus },
              { id: "fria", label: "Leche Fría", icon: Thermometer },
              { id: "caliente", label: "Leche Caliente", icon: Thermometer },
              { id: "pagos", label: "Cálculo de Pagos", icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    "flex items-center px-4 py-4 border-b-2 font-medium text-sm " +
                    (activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300")
                  }
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "registro" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-800">
                    Estado del Sistema
                  </h3>
                  <p className="text-blue-600">
                    Total de entregas registradas:{" "}
                    <span className="font-bold">{deliveries.length}</span>
                  </p>
                  {debugInfo && (
                    <p className="text-xs text-blue-500 mt-1">
                      Debug: {debugInfo}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">
                    Hoy:{" "}
                    {
                      deliveries.filter(
                        (d) =>
                          d.fecha === new Date().toISOString().split("T")[0]
                      ).length
                    }{" "}
                    entregas
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Gestión de Entregas
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Nueva Entrega
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Exportar CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Leche
                  </label>
                  <select
                    value={filter.tipo}
                    onChange={(e) =>
                      setFilter({ ...filter, tipo: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="fria">Fría</option>
                    <option value="caliente">Caliente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Origen
                  </label>
                  <select
                    value={filter.origen}
                    onChange={(e) =>
                      setFilter({ ...filter, origen: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="vaca">Vaca</option>
                    <option value="bufala">Búfala</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={filter.fecha}
                    onChange={(e) =>
                      setFilter({ ...filter, fecha: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productor
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar productor..."
                    value={filter.productor}
                    onChange={(e) =>
                      setFilter({ ...filter, productor: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Productor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Origen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad (L)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredDeliveries().map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(delivery.fecha).toLocaleDateString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {delivery.productor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                              (delivery.tipo === "fria"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800")
                            }
                          >
                            {delivery.tipo === "fria" ? "Fría" : "Caliente"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                              (delivery.origen === "vaca"
                                ? "bg-green-100 text-green-800"
                                : "bg-purple-100 text-purple-800")
                            }
                          >
                            {delivery.origen === "vaca" ? "Vaca" : "Búfala"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {delivery.cantidad.toLocaleString("es-ES")} L
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {getFilteredDeliveries().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron entregas con los filtros aplicados
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "fria" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-blue-500" />
                Entregas de Leche Fría
              </h2>
              <div className="bg-blue-100 px-4 py-2 rounded-lg">
                <span className="text-blue-800 font-medium">
                  Total:{" "}
                  {getColdMilkDeliveries()
                    .reduce((sum, d) => sum + d.cantidad, 0)
                    .toLocaleString("es-ES")}{" "}
                  L
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Productor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                      Cantidad (L)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getColdMilkDeliveries().map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-blue-25">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(delivery.fecha).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.productor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                            (delivery.origen === "vaca"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800")
                          }
                        >
                          {delivery.origen === "vaca" ? "Vaca" : "Búfala"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.cantidad.toLocaleString("es-ES")} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "caliente" && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Thermometer className="w-6 h-6 text-red-500" />
                Entregas de Leche Caliente
              </h2>
              <div className="bg-red-100 px-4 py-2 rounded-lg">
                <span className="text-red-800 font-medium">
                  Total:{" "}
                  {getHotMilkDeliveries()
                    .reduce((sum, d) => sum + d.cantidad, 0)
                    .toLocaleString("es-ES")}{" "}
                  L
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-red-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Productor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Cantidad (L)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getHotMilkDeliveries().map((delivery) => (
                    <tr key={delivery.id} className="hover:bg-red-25">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(delivery.fecha).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {delivery.productor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                            (delivery.origen === "vaca"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800")
                          }
                        >
                          {delivery.origen === "vaca" ? "Vaca" : "Búfala"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {delivery.cantidad.toLocaleString("es-ES")} L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "pagos" && (
          <div className="space-y-6">
            {/* Tarifas Semanales */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Tarifas por Semana
                </h3>
                <div className="flex gap-2">
                  {!getActiveRateForWeek(selectedWeek) ? (
                    <button
                      onClick={() => {
                        setWeekInForm(selectedWeek);
                        setShowWeeklyRatesForm(true);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Tarifa para Esta Semana
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const activeRate = getActiveRateForWeek(selectedWeek);
                        setWeeklyRateForm({
                          fechaInicio: activeRate.fechaInicio,
                          vaca_fria: activeRate.vaca_fria.toString(),
                          vaca_caliente: activeRate.vaca_caliente.toString(),
                          bufala_fria: activeRate.bufala_fria.toString(),
                          bufala_caliente:
                            activeRate.bufala_caliente.toString(),
                          observaciones: activeRate.observaciones,
                        });
                        setShowWeeklyRatesForm(true);
                      }}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Editar Tarifa Actual
                    </button>
                  )}
                  <button
                    onClick={() => {
                      // Resetear formulario para nueva semana
                      setWeeklyRateForm({
                        fechaInicio: getStartOfWeek(new Date())
                          .toISOString()
                          .split("T")[0],
                        vaca_fria: "",
                        vaca_caliente: "",
                        bufala_fria: "",
                        bufala_caliente: "",
                        observaciones: "",
                      });
                      setShowWeeklyRatesForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Planificar Nueva Semana
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">
                      Tarifa Activa - {formatWeekRange(selectedWeek)}
                    </h4>
                    {getActiveRateForWeek(selectedWeek) ? (
                      <p className="text-sm text-blue-700">
                        Usando tarifas específicas para esta semana
                        {getActiveRateForWeek(selectedWeek).observaciones &&
                          " - " +
                            getActiveRateForWeek(selectedWeek).observaciones}
                      </p>
                    ) : (
                      <p className="text-sm text-orange-700">
                        ⚠️ Sin tarifa definida - Los pagos serán €0.00
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {getActiveRateForWeek(selectedWeek) ? (
                      <div className="text-sm text-blue-800">
                        <div>
                          Vaca F: €
                          {getActiveRateForWeek(selectedWeek).vaca_fria.toFixed(
                            3
                          )}
                        </div>
                        <div>
                          Búfala F: €
                          {getActiveRateForWeek(
                            selectedWeek
                          ).bufala_fria.toFixed(3)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-orange-800">
                        <div>Vaca F: €0.000</div>
                        <div>Búfala F: €0.000</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {weeklyRates.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Semana
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaca Fría
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaca Caliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Búfala Fría
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Búfala Caliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Observaciones
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {weeklyRates.slice(0, 8).map((rate) => (
                        <tr
                          key={rate.id}
                          className={
                            "hover:bg-gray-50 " +
                            (rate.fechaInicio ===
                            selectedWeek.toISOString().split("T")[0]
                              ? "bg-blue-25 border border-blue-200"
                              : "")
                          }
                        >
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatWeekRange(new Date(rate.fechaInicio))}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{rate.vaca_fria.toFixed(3)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{rate.vaca_caliente.toFixed(3)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{rate.bufala_fria.toFixed(3)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            €{rate.bufala_caliente.toFixed(3)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {rate.observaciones || "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => {
                                setWeeklyRateForm({
                                  fechaInicio: rate.fechaInicio,
                                  vaca_fria: rate.vaca_fria.toString(),
                                  vaca_caliente: rate.vaca_caliente.toString(),
                                  bufala_fria: rate.bufala_fria.toString(),
                                  bufala_caliente:
                                    rate.bufala_caliente.toString(),
                                  observaciones: rate.observaciones,
                                });
                                setShowWeeklyRatesForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay tarifas semanales registradas</p>
                  <p className="text-sm mt-1">
                    Las entregas usarán las tarifas generales hasta que registre
                    tarifas específicas
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Seleccionar Semana
                </h3>
                <button
                  onClick={goToCurrentWeek}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Semana Actual
                </button>
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={goToPreviousWeek}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="bg-gray-50 px-6 py-3 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Semana del</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatWeekRange(selectedWeek)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={goToNextWeek}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Pagos Semanales - {formatWeekRange(selectedWeek)}
              </h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Productor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaca Fría (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaca Caliente (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Búfala Fría (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Búfala Caliente (L)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Litros
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Pago
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {calculateWeeklyPayments().map((payment, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.productor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.vaca_fria.toLocaleString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.vaca_caliente.toLocaleString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.bufala_fria.toLocaleString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payment.bufala_caliente.toLocaleString("es-ES")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payment.totalLitros.toLocaleString("es-ES")} L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                          €{payment.totalPago.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        TOTALES
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.vaca_fria, 0)
                          .toLocaleString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.vaca_caliente, 0)
                          .toLocaleString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.bufala_fria, 0)
                          .toLocaleString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.bufala_caliente, 0)
                          .toLocaleString("es-ES")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.totalLitros, 0)
                          .toLocaleString("es-ES")}{" "}
                        L
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        €
                        {calculateWeeklyPayments()
                          .reduce((sum, p) => sum + p.totalPago, 0)
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {calculateWeeklyPayments().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay entregas registradas para la semana seleccionada
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {showWeeklyRatesForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {weeklyRates.find(
                  (r) => r.fechaInicio === weeklyRateForm.fechaInicio
                )
                  ? "Editar"
                  : "Registrar"}{" "}
                Tarifas Semanales
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Inicio de Semana (Domingo)
                  </label>
                  <input
                    type="date"
                    value={weeklyRateForm.fechaInicio}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const weekStart = getStartOfWeek(selectedDate);
                      handleWeeklyRateChange(
                        "fechaInicio",
                        weekStart.toISOString().split("T")[0]
                      );
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Semana:{" "}
                    {formatWeekRange(new Date(weeklyRateForm.fechaInicio))}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaca Fría (€/L)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={weeklyRateForm.vaca_fria}
                      onChange={(e) =>
                        handleWeeklyRateChange("vaca_fria", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="€0.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vaca Caliente (€/L)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={weeklyRateForm.vaca_caliente}
                      onChange={(e) =>
                        handleWeeklyRateChange("vaca_caliente", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="€0.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Búfala Fría (€/L)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={weeklyRateForm.bufala_fria}
                      onChange={(e) =>
                        handleWeeklyRateChange("bufala_fria", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="€0.000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Búfala Caliente (€/L)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={weeklyRateForm.bufala_caliente}
                      onChange={(e) =>
                        handleWeeklyRateChange(
                          "bufala_caliente",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="€0.000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones (opcional)
                  </label>
                  <textarea
                    value={weeklyRateForm.observaciones}
                    onChange={(e) =>
                      handleWeeklyRateChange("observaciones", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Motivo del cambio, condiciones especiales, etc."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Información:</strong> Solo se pagarán las
                    entregas que tengan tarifas definidas para su semana. Las
                    entregas sin tarifa semanal tendrán pago de €0.00.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleWeeklyRateSubmit}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    {weeklyRates.find(
                      (r) => r.fechaInicio === weeklyRateForm.fechaInicio
                    )
                      ? "Actualizar"
                      : "Guardar"}{" "}
                    Tarifas
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWeeklyRatesForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nueva Entrega de Leche
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Productor
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.productor}
                    onChange={(e) =>
                      handleInputChange("productor", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del productor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Thermometer className="w-4 h-4 inline mr-1" />
                    Tipo de Leche
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => handleInputChange("tipo", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fria">Leche Fría</option>
                    <option value="caliente">Leche Caliente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Droplets className="w-4 h-4 inline mr-1" />
                    Origen
                  </label>
                  <select
                    value={formData.origen}
                    onChange={(e) =>
                      handleInputChange("origen", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vaca">Vaca</option>
                    <option value="bufala">Búfala</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cantidad (Litros)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.cantidad}
                    onChange={(e) =>
                      handleInputChange("cantidad", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Fecha de Entrega
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fecha}
                    onChange={(e) => handleInputChange("fecha", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  >
                    Registrar Entrega
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 border">
        <h4 className="font-semibold text-gray-900 mb-2">Resumen del Día</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Total entregas:</span>
            <span className="font-medium">
              {
                deliveries.filter(
                  (d) => d.fecha === new Date().toISOString().split("T")[0]
                ).length
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span>Litros totales:</span>
            <span className="font-medium">
              {deliveries
                .filter(
                  (d) => d.fecha === new Date().toISOString().split("T")[0]
                )
                .reduce((sum, d) => sum + d.cantidad, 0)
                .toLocaleString("es-ES")}{" "}
              L
            </span>
          </div>
          <div className="flex justify-between">
            <span>Productores activos:</span>
            <span className="font-medium">
              {
                new Set(
                  deliveries
                    .filter(
                      (d) => d.fecha === new Date().toISOString().split("T")[0]
                    )
                    .map((d) => d.productor)
                ).size
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheeseFactoryApp;
