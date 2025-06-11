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
    productorId: "",
    productorNombre: "",
    tipo: "fria",
    origen: "vaca",
    cantidad: "",
    fecha: new Date().toISOString().split("T")[0],
  });
  const [debugInfo, setDebugInfo] = useState("");

  // Estados para gestión de productores
  const [producers, setProducers] = useState([]);
  const [showProducerSuggestions, setShowProducerSuggestions] = useState(false);
  const [filteredProducers, setFilteredProducers] = useState([]);
  const [showNewProducerForm, setShowNewProducerForm] = useState(false);
  const [newProducerData, setNewProducerData] = useState({
    nombre: "",
    rif: "",
    correo: "",
    telefono: "",
  });

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
        productorId: "prod-1",
        productorNombre: "Granja López",
        tipo: "fria",
        origen: "vaca",
        cantidad: 150,
        fecha: new Date().toISOString().split("T")[0],
        fechaRegistro: new Date().toISOString(),
      },
      {
        id: 2,
        productorId: "prod-2",
        productorNombre: "Finca Rodríguez",
        tipo: "caliente",
        origen: "bufala",
        cantidad: 85,
        fecha: new Date().toISOString().split("T")[0],
        fechaRegistro: new Date().toISOString(),
      },
    ];
    setDeliveries(exampleData);

    // Inicializar productores con datos completos
    const exampleProducers = [
      {
        id: "prod-1",
        nombre: "Granja López",
        rif: "J-12345678-9",
        correo: "granja.lopez@email.com",
        telefono: "0412-1234567",
      },
      {
        id: "prod-2",
        nombre: "Finca Rodríguez",
        rif: "J-87654321-0",
        correo: "finca.rodriguez@email.com",
        telefono: "0424-7654321",
      },
      {
        id: "prod-3",
        nombre: "Granja López",
        rif: "J-11111111-1",
        correo: "otra.granja.lopez@email.com",
        telefono: "0416-1111111",
      },
      {
        id: "prod-4",
        nombre: "Establo San Miguel",
        rif: "J-22222222-2",
        correo: "sanmiguel@email.com",
        telefono: "0426-2222222",
      },
    ];
    setProducers(exampleProducers);

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

    if (!formData.productorId) {
      alert("Por favor, seleccione un productor válido");
      return;
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      alert("Por favor, ingrese una cantidad válida");
      return;
    }

    const newDelivery = {
      id: Date.now() + Math.random(),
      productorId: formData.productorId,
      productorNombre: formData.productorNombre,
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
      productorId: "",
      productorNombre: "",
      tipo: "fria",
      origen: "vaca",
      cantidad: "",
      fecha: new Date().toISOString().split("T")[0],
    });

    setShowForm(false);
    setShowProducerSuggestions(false);
    alert(
      "Entrega registrada: " +
        newDelivery.cantidad +
        "L de " +
        newDelivery.productorNombre
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

    // Autocompletado para productor
    if (field === "productorNombre") {
      if (value.trim() === "") {
        setShowProducerSuggestions(false);
        setFilteredProducers([]);
      } else {
        const filtered = producers.filter(
          (producer) =>
            producer.nombre.toLowerCase().includes(value.toLowerCase()) ||
            producer.rif.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredProducers(filtered);
        setShowProducerSuggestions(filtered.length > 0);
      }
    }
  };

  const selectProducer = (producer) => {
    setFormData((prev) => ({
      ...prev,
      productorId: producer.id,
      productorNombre: producer.nombre,
    }));
    setShowProducerSuggestions(false);
    setFilteredProducers([]);
  };

  const handleNewProducerSubmit = () => {
    if (!newProducerData.nombre.trim() || !newProducerData.rif.trim()) {
      alert("Por favor, complete al menos el nombre y RIF del productor");
      return;
    }

    // Verificar que el RIF no exista
    const existingProducer = producers.find(
      (p) => p.rif === newProducerData.rif
    );
    if (existingProducer) {
      alert("Ya existe un productor con este RIF: " + existingProducer.nombre);
      return;
    }

    const newProducer = {
      id: "prod-" + Date.now(),
      nombre: newProducerData.nombre.trim(),
      rif: newProducerData.rif.trim(),
      correo: newProducerData.correo.trim(),
      telefono: newProducerData.telefono.trim(),
    };

    setProducers((prev) =>
      [...prev, newProducer].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );

    // Seleccionar automáticamente el nuevo productor
    setFormData((prev) => ({
      ...prev,
      productorId: newProducer.id,
      productorNombre: newProducer.nombre,
    }));

    // Resetear formulario de nuevo productor
    setNewProducerData({
      nombre: "",
      rif: "",
      correo: "",
      telefono: "",
    });

    // Cerrar modal de productor y volver al modal de entrega
    setShowNewProducerForm(false);
    setShowForm(true);

    alert("Productor registrado correctamente: " + newProducer.nombre);
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
          delivery.productorNombre
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
      const key = delivery.productorId;
      if (!producerTotals[key]) {
        producerTotals[key] = {
          productorId: delivery.productorId,
          productorNombre: delivery.productorNombre,
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
                          {delivery.productorNombre}
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
                        {delivery.productorNombre}
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
                        {delivery.productorNombre}
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
                          {payment.productorNombre}
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

      {/* Modal para Nuevo Productor */}
      {showNewProducerForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Registrar Nuevo Productor
                </h3>
                <button
                  onClick={() => {
                    setShowNewProducerForm(false);
                    setShowForm(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProducerData.nombre}
                    onChange={(e) =>
                      setNewProducerData({
                        ...newProducerData,
                        nombre: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Granja López C.A."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RIF *
                  </label>
                  <input
                    type="text"
                    required
                    value={newProducerData.rif}
                    onChange={(e) =>
                      setNewProducerData({
                        ...newProducerData,
                        rif: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: J-12345678-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={newProducerData.correo}
                    onChange={(e) =>
                      setNewProducerData({
                        ...newProducerData,
                        correo: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newProducerData.telefono}
                    onChange={(e) =>
                      setNewProducerData({
                        ...newProducerData,
                        telefono: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0412-1234567"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El RIF debe ser único. Pueden existir
                    varios productores con el mismo nombre pero diferentes RIF.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleNewProducerSubmit}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                  >
                    Registrar y Continuar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewProducerForm(false);
                      setShowForm(true);
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal del Formulario de Entregas */}

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Nueva Entrega de Leche
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setShowProducerSuggestions(false);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <User className="w-4 h-4 inline mr-1" />
                    Productor
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        required
                        value={formData.productorNombre}
                        onChange={(e) =>
                          handleInputChange("productorNombre", e.target.value)
                        }
                        onFocus={() => {
                          if (formData.productorNombre.trim() !== "") {
                            const filtered = producers.filter(
                              (producer) =>
                                producer.nombre
                                  .toLowerCase()
                                  .includes(
                                    formData.productorNombre.toLowerCase()
                                  ) ||
                                producer.rif
                                  .toLowerCase()
                                  .includes(
                                    formData.productorNombre.toLowerCase()
                                  )
                            );
                            setFilteredProducers(filtered);
                            setShowProducerSuggestions(filtered.length > 0);
                          }
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Escriba nombre o RIF del productor..."
                        autoComplete="off"
                      />

                      {/* Lista de sugerencias */}
                      {showProducerSuggestions &&
                        filteredProducers.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                            {filteredProducers.map((producer) => (
                              <button
                                key={producer.id}
                                type="button"
                                onClick={() => selectProducer(producer)}
                                className="w-full text-left px-3 py-3 hover:bg-blue-50 hover:text-blue-700 focus:bg-blue-50 focus:text-blue-700 focus:outline-none border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">
                                  {producer.nombre}
                                </div>
                                <div className="text-xs text-gray-500">
                                  RIF: {producer.rif}
                                  {producer.correo && " • " + producer.correo}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setShowNewProducerForm(true);
                      }}
                      className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      title="Agregar nuevo productor"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Contador de productores */}
                  <p className="text-xs text-gray-500 mt-1">
                    {producers.length} productores registrados
                    {formData.productorId && (
                      <span className="ml-2 text-green-600">
                        ✓ Seleccionado
                      </span>
                    )}
                  </p>
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
                    onClick={() => {
                      setShowForm(false);
                      setShowProducerSuggestions(false);
                    }}
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
                deliveries
                  .filter(
                    (d) => d.fecha === new Date().toISOString().split("T")[0]
                  )
                  .map((d) => d.productorNombre).size
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheeseFactoryApp;
