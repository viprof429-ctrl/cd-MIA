import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  StatusBar,
  Platform,
} from 'react-native';

// --- TIPOS DE DATOS ---
type TipoCuenta = 'Efectivo' | 'Banco' | 'Billetera';

interface Cuenta {
  id: string;
  nombre: string;
  tipo: TipoCuenta;
  saldoInicial: number;
  icono: string;
}

interface Movimiento {
  id: number;
  cuentaId: string;
  categoria: string;
  concepto: string;
  valor: number;
  tipo: 'Ingreso' | 'Gasto';
  fecha: string;
}

interface Pasivo {
  id: string;
  concepto: string;
  acreedor: string;
  saldoInicial: number;
  cuotaMensual: number;
  vencimiento: string;
  fondoPago: string;
  estado: 'Activo' | 'Pagado';
}

interface CuentaPorCobrar {
  id: string;
  concepto: string;
  terceroDeudor: string;
  montoPorCobrar: number;
  abonoRecibido: number;
  fechaLimite: string;
  fondoDestino: string;
  estado: 'Pendiente' | 'Recibido';
}

// Cuentas base en limpio para usuarios nuevos
const CUENTAS_BASE: Cuenta[] = [
  { id: '1', nombre: 'Efectivo en Mano', tipo: 'Efectivo', saldoInicial: 0, icono: '💵' },
  { id: '2', nombre: 'Bancolombia', tipo: 'Banco', saldoInicial: 0, icono: '🏦' },
  { id: '3', nombre: 'Nequi', tipo: 'Billetera', saldoInicial: 0, icono: '📱' },
];

const PASIVOS_BASE: Pasivo[] = [
  { id: '1', concepto: 'Préstamo Bancario', acreedor: 'Acreedor Banco', saldoInicial: 5000000, cuotaMensual: 500000, vencimiento: '2026-11-15', fondoPago: 'Efectivo en Mano', estado: 'Activo' },
  { id: '2', concepto: 'Servicios Públicos (Luz)', acreedor: 'Empresa de Energía', saldoInicial: 150000, cuotaMensual: 150050, vencimiento: '2026-11-05', fondoPago: 'Bancolombia', estado: 'Activo' },
];

const COBRAR_BASE: CuentaPorCobrar[] = [
  { id: '1', concepto: 'Préstamo Personal', terceroDeudor: 'Tercero Deudor', montoPorCobrar: 1000000, abonoRecibido: 0, fechaLimite: '2026-11-30', fondoDestino: 'Nequi', estado: 'Pendiente' },
];

const CATEGORIAS_GASTO = [
  'Alimentación',
  'Transporte',
  'Servicios / Hogar',
  'Ocio / Salidas',
  'Salud',
  'Educación',
  'Otros Gastos',
];

const CATEGORIAS_INGRESO = [
  'Salario / Nómina',
  'Ventas / Negocio',
  'Otros Ingresos',
];

// --- FUNCIONES DE ALMACENAMIENTO LOCAL POR DISPOSITIVO ---
const guardarEnStorage = (clave: string, valor: any) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(clave, JSON.stringify(valor));
    }
  } catch (e) {
    // Modo seguro
  }
};

const cargarDeStorage = <T,>(clave: string, valorPorDefecto: T): T => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const data = window.localStorage.getItem(clave);
      if (data) {
        return JSON.parse(data);
      }
    }
  } catch (e) {
    // Modo seguro
  }
  return valorPorDefecto;
};

// Formato de moneda COP
const formatoCOP = (valor: number): string => {
  if (isNaN(valor) || valor === null || valor === undefined) return '$ 0';
  const signo = valor < 0 ? '-' : '';
  const valorAbs = Math.abs(Math.round(valor));
  const partes = valorAbs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${signo}$ ${partes}`;
};

const fechaHoy = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
};

const primerDiaMes = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01`;
};

const notificar = (titulo: string, mensaje: string) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(`${titulo}\n\n${mensaje}`);
  } else {
    Alert.alert(titulo, mensaje);
  }
};

export default function App() {
  const [tab, setTab] = useState<'inicio' | 'cuentas' | 'pasivos' | 'cobrar' | 'reportes'>('inicio');

  // Estados cargados desde almacenamiento local
  const [cuentas, setCuentas] = useState<Cuenta[]>(() =>
    cargarDeStorage<Cuenta[]>('mia_cuentas_v3', CUENTAS_BASE)
  );

  const [movimientos, setMovimientos] = useState<Movimiento[]>(() =>
    cargarDeStorage<Movimiento[]>('mia_movimientos_v3', [])
  );

  const [pasivos, setPasivos] = useState<Pasivo[]>(() =>
    cargarDeStorage<Pasivo[]>('mia_pasivos_v3', PASIVOS_BASE)
  );

  const [cuentasCobrar, setCuentasCobrar] = useState<CuentaPorCobrar[]>(() =>
    cargarDeStorage<CuentaPorCobrar[]>('mia_cobrar_v3', COBRAR_BASE)
  );

  // Guardado persistente automático
  useEffect(() => {
    guardarEnStorage('mia_cuentas_v3', cuentas);
  }, [cuentas]);

  useEffect(() => {
    guardarEnStorage('mia_movimientos_v3', movimientos);
  }, [movimientos]);

  useEffect(() => {
    guardarEnStorage('mia_pasivos_v3', pasivos);
  }, [pasivos]);

  useEffect(() => {
    guardarEnStorage('mia_cobrar_v3', cuentasCobrar);
  }, [cuentasCobrar]);

  // Formulario Movimientos
  const [tipoMovimiento, setTipoMovimiento] = useState<'Gasto' | 'Ingreso'>('Gasto');
  const [cuentaSeleccionada, setCuentaSeleccionada] = useState<string>(cuentas[0]?.id || '1');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(CATEGORIAS_GASTO[0]);
  const [concepto, setConcepto] = useState('');
  const [valor, setValor] = useState('');
  const [fechaMovimiento, setFechaMovimiento] = useState(fechaHoy());

  // Modales Cuentas
  const [modalNuevaCuenta, setModalNuevaCuenta] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<TipoCuenta>('Banco');
  const [nuevoSaldoInit, setNuevoSaldoInit] = useState('');

  const [modalEditarSaldo, setModalEditarSaldo] = useState(false);
  const [cuentaAEditar, setCuentaAEditar] = useState<Cuenta | null>(null);
  const [saldoEditadoValor, setSaldoEditadoValor] = useState('');

  // Modales Pasivos
  const [modalNuevoPasivo, setModalNuevoPasivo] = useState(false);
  const [pasivoConcepto, setPasivoConcepto] = useState('');
  const [pasivoAcreedor, setPasivoAcreedor] = useState('');
  const [pasivoSaldo, setPasivoSaldo] = useState('');
  const [pasivoCuota, setPasivoCuota] = useState('');
  const [pasivoVencimiento, setPasivoVencimiento] = useState(fechaHoy());
  const [pasivoFondo, setPasivoFondo] = useState('');

  // Modales Cuentas por Cobrar
  const [modalNuevoCobro, setModalNuevoCobro] = useState(false);
  const [cobroConcepto, setCobroConcepto] = useState('');
  const [cobroTercero, setCobroTercero] = useState('');
  const [cobroMonto, setCobroMonto] = useState('');
  const [cobroFecha, setCobroFecha] = useState(fechaHoy());
  const [cobroFondo, setCobroFondo] = useState('');

  // Filtros Reportes
  const [fechaDesde, setFechaDesde] = useState(primerDiaMes());
  const [fechaHasta, setFechaHasta] = useState(fechaHoy());

  // --- CÁLCULOS FINANCIEROS ---
  const obtenerSaldoCuenta = (cuentaId: string): number => {
    const c = cuentas.find((item) => item.id === cuentaId);
    if (!c) return 0;
    const ing = movimientos
      .filter((m) => m.cuentaId === cuentaId && m.tipo === 'Ingreso')
      .reduce((acc, m) => acc + m.valor, 0);
    const gas = movimientos
      .filter((m) => m.cuentaId === cuentaId && m.tipo === 'Gasto')
      .reduce((acc, m) => acc + m.valor, 0);
    return c.saldoInicial + ing - gas;
  };

  const patrimonioTotal = cuentas.reduce((acc, c) => acc + obtenerSaldoCuenta(c.id), 0);
  const totalPasivos = pasivos.filter(p => p.estado === 'Activo').reduce((acc, p) => acc + p.saldoInicial, 0);
  const totalPorCobrar = cuentasCobrar.filter(c => c.estado === 'Pendiente').reduce((acc, c) => acc + (c.montoPorCobrar - c.abonoRecibido), 0);

  const guardarMovimiento = () => {
    const num = parseInt(valor.replace(/\D/g, ''), 10);
    if (!concepto.trim() || isNaN(num) || num <= 0) {
      notificar('Datos incompletos', 'Escribe un concepto y un valor numérico válido en COP.');
      return;
    }

    const nuevo: Movimiento = {
      id: Date.now(),
      cuentaId: cuentaSeleccionada,
      categoria: categoriaSeleccionada,
      concepto: concepto.trim(),
      valor: num,
      tipo: tipoMovimiento,
      fecha: fechaMovimiento.trim() || fechaHoy(),
    };

    setMovimientos((prev) => [nuevo, ...prev]);
    setConcepto('');
    setValor('');
    notificar('¡Registrado!', `${tipoMovimiento} guardado con éxito.`);
  };

  const guardarNuevaCuenta = () => {
    const saldo = parseInt(nuevoSaldoInit.replace(/\D/g, ''), 10) || 0;
    if (!nuevoNombre.trim()) {
      notificar('Falta el nombre', 'Ingresa el nombre del banco o cuenta.');
      return;
    }

    const iconos: Record<TipoCuenta, string> = {
      Efectivo: '💵',
      Banco: '🏦',
      Billetera: '📱',
    };

    const nueva: Cuenta = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      tipo: nuevoTipo,
      saldoInicial: saldo,
      icono: iconos[nuevoTipo],
    };

    setCuentas((prev) => [...prev, nueva]);
    setNuevoNombre('');
    setNuevoSaldoInit('');
    setModalNuevaCuenta(false);
  };

  const actualizarSaldoInicial = () => {
    if (!cuentaAEditar) return;
    const nuevoMonto = parseInt(saldoEditadoValor.replace(/\D/g, ''), 10) || 0;

    setCuentas((prev) =>
      prev.map((c) =>
        c.id === cuentaAEditar.id ? { ...c, saldoInicial: nuevoMonto } : c
      )
    );
    setModalEditarSaldo(false);
    setCuentaAEditar(null);
    notificar('Saldo Actualizado', 'El saldo inicial ha sido modificado.');
  };

  const guardarNuevoPasivo = () => {
    const saldo = parseInt(pasivoSaldo.replace(/\D/g, ''), 10) || 0;
    const cuota = parseInt(pasivoCuota.replace(/\D/g, ''), 10) || 0;
    if (!pasivoConcepto.trim() || saldo <= 0) {
      notificar('Datos incompletos', 'Ingresa el concepto y un saldo inicial válido.');
      return;
    }

    const nuevo: Pasivo = {
      id: Date.now().toString(),
      concepto: pasivoConcepto.trim(),
      acreedor: pasivoAcreedor.trim() || 'General',
      saldoInicial: saldo,
      cuotaMensual: cuota,
      vencimiento: pasivoVencimiento,
      fondoPago: pasivoFondo || cuentas[0]?.nombre || 'General',
      estado: 'Activo',
    };

    setPasivos((prev) => [...prev, nuevo]);
    setPasivoConcepto('');
    setPasivoAcreedor('');
    setPasivoSaldo('');
    setPasivoCuota('');
    setModalNuevoPasivo(false);
    notificar('Pasivo Creado', 'La obligación ha sido agregada.');
  };

  const pagarPasivo = (id: string) => {
    const p = pasivos.find(item => item.id === id);
    if (!p || p.estado === 'Pagado') return;

    const cuentaAsociada = cuentas.find(c => c.nombre === p.fondoPago) || cuentas[0];
    if (!cuentaAsociada) {
      notificar('Error', 'No hay cuentas configuradas para realizar el pago.');
      return;
    }

    const montoPago = p.cuotaMensual > 0 ? Math.min(p.cuotaMensual, p.saldoInicial) : p.saldoInicial;
    const nuevoSaldo = p.saldoInicial - montoPago;
    const nuevoEstado = nuevoSaldo <= 0 ? 'Pagado' : 'Activo';

    const movimientoGasto: Movimiento = {
      id: Date.now(),
      cuentaId: cuentaAsociada.id,
      categoria: 'Servicios / Hogar',
      concepto: `Pago pasivo: ${p.concepto}`,
      valor: montoPago,
      tipo: 'Gasto',
      fecha: fechaHoy(),
    };

    setMovimientos(prev => [movimientoGasto, ...prev]);
    setPasivos(prev => prev.map(item => item.id === id ? { ...item, saldoInicial: nuevoSaldo, estado: nuevoEstado } : item));
    notificar('Pago Registrado', `Se descontaron ${formatoCOP(montoPago)} de ${cuentaAsociada.nombre}.`);
  };

  const guardarNuevoCobro = () => {
    const monto = parseInt(cobroMonto.replace(/\D/g, ''), 10) || 0;
    if (!cobroConcepto.trim() || monto <= 0) {
      notificar('Datos incompletos', 'Ingresa el concepto y un monto válido.');
      return;
    }

    const nuevo: CuentaPorCobrar = {
      id: Date.now().toString(),
      concepto: cobroConcepto.trim(),
      terceroDeudor: cobroTercero.trim() || 'Tercero',
      montoPorCobrar: monto,
      abonoRecibido: 0,
      fechaLimite: cobroFecha,
      fondoDestino: cobroFondo || cuentas[0]?.nombre || 'General',
      estado: 'Pendiente',
    };

    setCuentasCobrar((prev) => [...prev, nuevo]);
    setCobroConcepto('');
    setCobroTercero('');
    setCobroMonto('');
    setModalNuevoCobro(false);
    notificar('Cuenta por Cobrar Creada', 'El registro ha sido guardado.');
  };

  const recibirCobro = (id: string) => {
    const c = cuentasCobrar.find(item => item.id === id);
    if (!c || c.estado === 'Recibido') return;

    const saldoPendiente = c.montoPorCobrar - c.abonoRecibido;
    const cuentaAsociada = cuentas.find(acc => acc.nombre === c.fondoDestino) || cuentas[0];

    if (!cuentaAsociada) {
      notificar('Error', 'No hay cuentas configuradas para recibir el dinero.');
      return;
    }

    const movimientoIngreso: Movimiento = {
      id: Date.now(),
      cuentaId: cuentaAsociada.id,
      categoria: 'Otros Ingresos',
      concepto: `Cobro deudor: ${c.concepto}`,
      valor: saldoPendiente,
      tipo: 'Ingreso',
      fecha: fechaHoy(),
    };

    setMovimientos(prev => [movimientoIngreso, ...prev]);
    setCuentasCobrar(prev => prev.map(item => item.id === id ? { ...item, abonoRecibido: c.montoPorCobrar, estado: 'Recibido' } : item));
    notificar('Cobro Recibido', `Se ingresaron ${formatoCOP(saldoPendiente)} a ${cuentaAsociada.nombre}.`);
  };

  const reiniciarTodo = () => {
    const confirmar =
      Platform.OS === 'web' && typeof window !== 'undefined'
        ? window.confirm('¿Deseas borrar todos tus movimientos y empezar en limpio?')
        : true;

    if (confirmar) {
      setCuentas(CUENTAS_BASE);
      setMovimientos([]);
      setPasivos(PASIVOS_BASE);
      setCuentasCobrar(COBRAR_BASE);
      notificar('Reinicio completo', 'Tus datos se han reiniciado.');
    }
  };

  const movimientosReporte = movimientos.filter((m) => {
    if (!fechaDesde && !fechaHasta) return true;
    if (fechaDesde && m.fecha < fechaDesde) return false;
    if (fechaHasta && m.fecha > fechaHasta) return false;
    return true;
  });

  const totalGastosReporte = movimientosReporte
    .filter((m) => m.tipo === 'Gasto')
    .reduce((acc, m) => acc + m.valor, 0);

  const totalIngresosReporte = movimientosReporte
    .filter((m) => m.tipo === 'Ingreso')
    .reduce((acc, m) => acc + m.valor, 0);

  const rubrosAgrupados = movimientosReporte
    .filter((m) => m.tipo === 'Gasto')
    .reduce((acc: Record<string, number>, m) => {
      acc[m.categoria] = (acc[m.categoria] || 0) + m.valor;
      return acc;
    }, {});

  const listaRubros = Object.entries(rubrosAgrupados).sort((a, b) => b[1] - a[1]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F7F2" />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logo}>MIA</Text>
          <Text style={styles.subtitulo}>Mi Inteligencia de Ahorro Integral</Text>
        </View>

        {/* --- PESTAÑA: INICIO --- */}
        {tab === 'inicio' && (
          <View>
            <View style={styles.patrimonioCard}>
              <View style={styles.rowEntre}>
                <Text style={styles.patrimonioLabel}>PATRIMONIO NETO DISPONIBLE</Text>
                <TouchableOpacity onPress={() => setTab('cuentas')}>
                  <Text style={styles.btnAjustarTop}>⚙️ Cuentas</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.patrimonioMonto}>{formatoCOP(patrimonioTotal - totalPasivos + totalPorCobrar)}</Text>
              <Text style={styles.patrimonioSub}>
                Liquidez: {formatoCOP(patrimonioTotal)} | Pasivos: {formatoCOP(totalPasivos)}
              </Text>
            </View>

            <View style={styles.rowEntre}>
              <Text style={styles.seccionTitulo}>Tus Fondos y Cuentas</Text>
              <TouchableOpacity onPress={() => setTab('cuentas')}>
                <Text style={styles.linkVerde}>Ver detalles ›</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {cuentas.map((c) => (
                <View key={c.id} style={styles.miniCuenta}>
                  <Text style={{ fontSize: 22 }}>{c.icono}</Text>
                  <Text style={styles.miniNombre} numberOfLines={1}>{c.nombre}</Text>
                  <Text style={styles.miniSaldo}>{formatoCOP(obtenerSaldoCuenta(c.id))}</Text>
                </View>
              ))}
            </ScrollView>

            <Text style={[styles.seccionTitulo, { marginTop: 14 }]}>Registrar Movimiento</Text>
            <View style={styles.formCard}>
              <View style={styles.tipoRow}>
                <TouchableOpacity
                  style={[styles.tipoBtn, tipoMovimiento === 'Gasto' && styles.tipoGastoActivo]}
                  onPress={() => {
                    setTipoMovimiento('Gasto');
                    setCategoriaSeleccionada(CATEGORIAS_GASTO[0]);
                  }}
                >
                  <Text style={[styles.tipoBtnTxt, tipoMovimiento === 'Gasto' && styles.txtBlanco]}>
                    Gasto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tipoBtn, tipoMovimiento === 'Ingreso' && styles.tipoIngresoActivo]}
                  onPress={() => {
                    setTipoMovimiento('Ingreso');
                    setCategoriaSeleccionada(CATEGORIAS_INGRESO[0]);
                  }}
                >
                  <Text style={[styles.tipoBtnTxt, tipoMovimiento === 'Ingreso' && styles.txtBlanco]}>
                    Ingreso
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>¿En qué cuenta se mueve el dinero?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {cuentas.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, cuentaSeleccionada === c.id && styles.chipActivo]}
                    onPress={() => setCuentaSeleccionada(c.id)}
                  >
                    <Text style={[styles.chipTxt, cuentaSeleccionada === c.id && styles.txtBlanco]}>
                      {c.icono} {c.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Rubro o Categoría:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                {(tipoMovimiento === 'Gasto' ? CATEGORIAS_GASTO : CATEGORIAS_INGRESO).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, categoriaSeleccionada === cat && styles.chipActivo]}
                    onPress={() => setCategoriaSeleccionada(cat)}
                  >
                    <Text style={[styles.chipTxt, categoriaSeleccionada === cat && styles.txtBlanco]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Fecha (AAAA-MM-DD):</Text>
              <TextInput
                style={styles.input}
                value={fechaMovimiento}
                onChangeText={setFechaMovimiento}
                placeholder="AAAA-MM-DD"
              />

              <TextInput
                style={styles.input}
                placeholder="Concepto (ej. Almuerzo, Mercado, Nómina)"
                placeholderTextColor="#8F9F95"
                value={concepto}
                onChangeText={setConcepto}
              />

              <TextInput
                style={styles.input}
                placeholder="Valor en pesos (ej. 45000)"
                placeholderTextColor="#8F9F95"
                keyboardType="numeric"
                value={valor}
                onChangeText={setValor}
              />

              <TouchableOpacity style={styles.btnPrincipal} onPress={guardarMovimiento}>
                <Text style={styles.btnPrincipalTxt}>+ Guardar Movimiento</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.seccionTitulo, { marginTop: 18 }]}>Movimientos Recientes</Text>
            {movimientos.length === 0 ? (
              <Text style={styles.textoVacio}>Aún no has registrado movimientos.</Text>
            ) : (
              movimientos.slice(0, 5).map((m) => {
                const cuentaAsociada = cuentas.find((c) => c.id === m.cuentaId);
                return (
                  <View key={m.id} style={styles.itemMov}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.conceptoMov}>{m.concepto}</Text>
                      <Text style={styles.metaMov}>
                        📅 {m.fecha} · {cuentaAsociada?.nombre || 'Cuenta'} · {m.categoria}
                      </Text>
                    </View>
                    <Text style={m.tipo === 'Ingreso' ? styles.montoIngreso : styles.montoGasto}>
                      {m.tipo === 'Ingreso' ? '+' : '-'} {formatoCOP(m.valor)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* --- PESTAÑA: CUENTAS --- */}
        {tab === 'cuentas' && (
          <View>
            <View style={styles.rowEntre}>
              <Text style={styles.seccionTitulo}>Cuentas y Fondos</Text>
              <TouchableOpacity
                style={styles.btnNuevaCuenta}
                onPress={() => setModalNuevaCuenta(true)}
              >
                <Text style={styles.btnNuevaCuentaTxt}>+ Crear Cuenta</Text>
              </TouchableOpacity>
            </View>

            {cuentas.map((c) => {
              const saldoActual = obtenerSaldoCuenta(c.id);
              return (
                <View key={c.id} style={styles.cardCuentaCompleta}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 32 }}>{c.icono}</Text>
                    <View style={{ marginLeft: 12, flex: 1 }}>
                      <Text style={styles.nombreCuenta}>{c.nombre}</Text>
                      <Text style={styles.tipoCuentaTexto}>Tipo: {c.tipo}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.labelSaldo}>Saldo Actual:</Text>
                      <Text style={styles.saldoActualMonto}>{formatoCOP(saldoActual)}</Text>
                    </View>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.rowEntre}>
                    <View>
                      <Text style={styles.labelInit}>SALDO INICIAL:</Text>
                      <Text style={styles.montoInit}>{formatoCOP(c.saldoInicial)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.btnEditarSaldo}
                      onPress={() => {
                        setCuentaAEditar(c);
                        setSaldoEditadoValor(c.saldoInicial.toString());
                        setModalEditarSaldo(true);
                      }}
                    >
                      <Text style={styles.btnEditarSaldoTxt}>✏️ Modificar Inicial</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.btnReiniciar} onPress={reiniciarTodo}>
              <Text style={styles.btnReiniciarTxt}>🗑️ Reiniciar datos de este celular</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* --- PESTAÑA: PASIVOS --- */}
        {tab === 'pasivos' && (
          <View>
            <View style={styles.rowEntre}>
              <Text style={styles.seccionTitulo}>Módulo de Pasivos</Text>
              <TouchableOpacity
                style={styles.btnNuevaCuenta}
                onPress={() => setModalNuevoPasivo(true)}
              >
                <Text style={styles.btnNuevaCuentaTxt}>+ Añadir Pasivo</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.explicacion}>
              Controla tus obligaciones bancarias, acreedores y servicios. Al pagar, el dinero se descuenta automáticamente de tu fondo seleccionado.
            </Text>

            {pasivos.map((p) => (
              <View key={p.id} style={styles.cardCuentaCompleta}>
                <View style={styles.rowEntre}>
                  <Text style={styles.nombreCuenta}>{p.concepto}</Text>
                  <Text style={[styles.montoGasto, { fontSize: 13 }]}>{p.estado}</Text>
                </View>
                <Text style={styles.tipoCuentaTexto}>Acreedor: {p.acreedor}</Text>
                <Text style={styles.tipoCuentaTexto}>Vencimiento: {p.vencimiento} | Fondo pago: {p.fondoPago}</Text>

                <View style={{ marginVertical: 8 }}>
                  <Text style={styles.labelInit}>SALDO PENDIENTE:</Text>
                  <Text style={styles.saldoActualMonto}>{formatoCOP(p.saldoInicial)}</Text>
                  <Text style={styles.tipoCuentaTexto}>Cuota estimada: {formatoCOP(p.cuotaMensual)}</Text>
                </View>

                {p.estado === 'Activo' && (
                  <TouchableOpacity
                    style={[styles.btnPrincipal, { marginTop: 4, backgroundColor: '#C94A4A' }]}
                    onPress={() => pagarPasivo(p.id)}
                  >
                    <Text style={styles.btnPrincipalTxt}>💳 Pagar Cuota / Deuda</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* --- PESTAÑA: CUENTAS POR COBRAR --- */}
        {tab === 'cobrar' && (
          <View>
            <View style={styles.rowEntre}>
              <Text style={styles.seccionTitulo}>Cuentas por Cobrar</Text>
              <TouchableOpacity
                style={styles.btnNuevaCuenta}
                onPress={() => setModalNuevoCobro(true)}
              >
                <Text style={styles.btnNuevaCuentaTxt}>+ Añadir Cobro</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.explicacion}>
              Registra el dinero que te deben los terceros. Al recibir el pago, el saldo ingresará automáticamente al fondo destino seleccionado.
            </Text>

            {cuentasCobrar.map((c) => (
              <View key={c.id} style={styles.cardCuentaCompleta}>
                <View style={styles.rowEntre}>
                  <Text style={styles.nombreCuenta}>{c.concepto}</Text>
                  <Text style={[styles.montoIngreso, { fontSize: 13 }]}>{c.estado}</Text>
                </View>
                <Text style={styles.tipoCuentaTexto}>Deudor: {c.terceroDeudor}</Text>
                <Text style={styles.tipoCuentaTexto}>Fecha límite: {c.fechaLimite} | Ingresa a: {c.fondoDestino}</Text>

                <View style={{ marginVertical: 8 }}>
                  <Text style={styles.labelInit}>MONTO POR RECIBIR:</Text>
                  <Text style={styles.saldoActualMonto}>{formatoCOP(c.montoPorCobrar - c.abonoRecibido)}</Text>
                </View>

                {c.estado === 'Pendiente' && (
                  <TouchableOpacity
                    style={[styles.btnPrincipal, { marginTop: 4 }]}
                    onPress={() => recibirCobro(c.id)}
                  >
                    <Text style={styles.btnPrincipalTxt}>📥 Registrar Cobro / Ingreso</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* --- PESTAÑA: REPORTES --- */}
        {tab === 'reportes' && (
          <View>
            <Text style={styles.seccionTitulo}>Reporte Financiero</Text>

            <View style={styles.filtroCard}>
              <Text style={styles.label}>Período de consulta (AAAA-MM-DD):</Text>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSub}>Fecha Desde:</Text>
                  <TextInput
                    style={styles.inputFecha}
                    value={fechaDesde}
                    onChangeText={setFechaDesde}
                    placeholder="AAAA-MM-DD"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelSub}>Fecha Hasta:</Text>
                  <TextInput
                    style={styles.inputFecha}
                    value={fechaHasta}
                    onChangeText={setFechaHasta}
                    placeholder="AAAA-MM-DD"
                  />
                </View>
              </View>
            </View>

            <View style={styles.resumenPeriodoCard}>
              <Text style={styles.resumenLabel}>GASTOS DEL PERÍODO</Text>
              <Text style={styles.resumenMontoGasto}>{formatoCOP(totalGastosReporte)}</Text>
              <View style={styles.resumenDetalles}>
                <Text style={styles.resumenDetalleTxt}>
                  Ingresos en el rango: {formatoCOP(totalIngresosReporte)}
                </Text>
                <Text style={styles.resumenDetalleTxt}>
                  Ahorro neto: {formatoCOP(totalIngresosReporte - totalGastosReporte)}
                </Text>
              </View>
            </View>

            <Text style={[styles.seccionTitulo, { marginTop: 14 }]}>
              Distribución por Rubro ({listaRubros.length})
            </Text>

            {totalGastosReporte === 0 ? (
              <Text style={styles.textoVacio}>No existen gastos registrados en este período.</Text>
            ) : (
              <View style={styles.graficoBox}>
                <View style={styles.barraSegmentada}>
                  {listaRubros.map(([rubro, total], idx) => {
                    const pct = Math.max(1, Math.round((total / totalGastosReporte) * 100));
                    const paleta = ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7'];
                    return (
                      <View
                        key={rubro}
                        style={{
                          width: `${pct}%` as any,
                          backgroundColor: paleta[idx % paleta.length],
                          height: '100%',
                        }}
                      />
                    );
                  })}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* --- MODAL NUEVA CUENTA --- */}
      <Modal visible={modalNuevaCuenta} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Nueva Cuenta</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre (ej. Nequi, Bancolombia)"
              value={nuevoNombre}
              onChangeText={setNuevoNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Saldo inicial en COP"
              keyboardType="numeric"
              value={nuevoSaldoInit}
              onChangeText={setNuevoSaldoInit}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.btnPrincipal, { flex: 1, backgroundColor: '#8F9F95' }]}
                onPress={() => setModalNuevaCuenta(false)}
              >
                <Text style={styles.btnPrincipalTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrincipal, { flex: 1 }]} onPress={guardarNuevaCuenta}>
                <Text style={styles.btnPrincipalTxt}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL NUEVO PASIVO --- */}
      <Modal visible={modalNuevoPasivo} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Registrar Pasivo</Text>
            <TextInput
              style={styles.input}
              placeholder="Concepto (ej. Préstamo Banco)"
              value={pasivoConcepto}
              onChangeText={setPasivoConcepto}
            />
            <TextInput
              style={styles.input}
              placeholder="Acreedor / Entidad"
              value={pasivoAcreedor}
              onChangeText={setPasivoAcreedor}
            />
            <TextInput
              style={styles.input}
              placeholder="Saldo inicial total"
              keyboardType="numeric"
              value={pasivoSaldo}
              onChangeText={setPasivoSaldo}
            />
            <TextInput
              style={styles.input}
              placeholder="Cuota mensual estimada"
              keyboardType="numeric"
              value={pasivoCuota}
              onChangeText={setPasivoCuota}
            />
            <TextInput
              style={styles.input}
              placeholder="Fondo de pago (ej. Efectivo en Mano)"
              value={pasivoFondo}
              onChangeText={setPasivoFondo}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.btnPrincipal, { flex: 1, backgroundColor: '#8F9F95' }]}
                onPress={() => setModalNuevoPasivo(false)}
              >
                <Text style={styles.btnPrincipalTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrincipal, { flex: 1 }]} onPress={guardarNuevoPasivo}>
                <Text style={styles.btnPrincipalTxt}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL NUEVO COBRO --- */}
      <Modal visible={modalNuevoCobro} transparent animationType="slide">
        <View style={styles.modalFondo}>
          <View style={styles.modalCaja}>
            <Text style={styles.modalTitulo}>Cuenta por Cobrar</Text>
            <TextInput
              style={styles.input}
              placeholder="Concepto"
              value={cobroConcepto}
              onChangeText={setCobroConcepto}
            />
            <TextInput
              style={styles.input}
              placeholder="Tercero Deudor"
              value={cobroTercero}
              onChangeText={setCobroTercero}
            />
            <TextInput
              style={styles.input}
              placeholder="Monto por cobrar"
              keyboardType="numeric"
              value={cobroMonto}
              onChangeText={setCobroMonto}
            />
            <TextInput
              style={styles.input}
              placeholder="Fondo destino al recibir (ej. Nequi)"
              value={cobroFondo}
              onChangeText={setCobroFondo}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <TouchableOpacity
                style={[styles.btnPrincipal, { flex: 1, backgroundColor: '#8F9F95' }]}
                onPress={() => setModalNuevoCobro(false)}
              >
                <Text style={styles.btnPrincipalTxt}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btnPrincipal, { flex: 1 }]} onPress={guardarNuevoCobro}>
                <Text style={styles.btnPrincipalTxt}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- NAVEGACIÓN INFERIOR --- */}
      <View style={styles.barraNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('inicio')}>
          <Text style={[styles.navIcono, tab === 'inicio' && styles.navActivo]}>🏠</Text>
          <Text style={[styles.navTexto, tab === 'inicio' && styles.navTextoActivo]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('cuentas')}>
          <Text style={[styles.navIcono, tab === 'cuentas' && styles.navActivo]}>🏦</Text>
          <Text style={[styles.navTexto, tab === 'cuentas' && styles.navTextoActivo]}>Cuentas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('pasivos')}>
          <Text style={[styles.navIcono, tab === 'pasivos' && styles.navActivo]}>💳</Text>
          <Text style={[styles.navTexto, tab === 'pasivos' && styles.navTextoActivo]}>Pasivos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('cobrar')}>
          <Text style={[styles.navIcono, tab === 'cobrar' && styles.navActivo]}>📥</Text>
          <Text style={[styles.navTexto, tab === 'cobrar' && styles.navTextoActivo]}>Por Cobrar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navBtn} onPress={() => setTab('reportes')}>
          <Text style={[styles.navIcono, tab === 'reportes' && styles.navActivo]}>📊</Text>
          <Text style={[styles.navTexto, tab === 'reportes' && styles.navTextoActivo]}>Reportes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F7F2' },
  scroll: { padding: 18, paddingBottom: 95 },
  header: { alignItems: 'center', marginBottom: 14 },
  logo: { fontSize: 32, fontWeight: '800', color: '#1B4332' },
  subtitulo: { fontSize: 13, color: '#40916C', fontWeight: '600' },

  patrimonioCard: { backgroundColor: '#1B4332', borderRadius: 20, padding: 20, marginBottom: 16, elevation: 3 },
  patrimonioLabel: { color: '#B7E4C7', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  btnAjustarTop: { color: '#B7E4C7', fontSize: 12, fontWeight: '700' },
  patrimonioMonto: { color: '#FFFFFF', fontSize: 26, fontWeight: '800', marginVertical: 8 },
  patrimonioSub: { color: '#D8F3DC', fontSize: 11 },

  rowEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  seccionTitulo: { fontSize: 17, fontWeight: '700', color: '#1B4332' },
  linkVerde: { fontSize: 12, color: '#2D6A4F', fontWeight: '700' },
  miniCuenta: { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 14, marginRight: 10, width: 125, elevation: 2 },
  miniNombre: { fontSize: 12, fontWeight: '600', color: '#2D3748', marginTop: 4 },
  miniSaldo: { fontSize: 13, fontWeight: '700', color: '#205B43', marginTop: 2 },

  formCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginTop: 8, elevation: 2 },
  tipoRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  tipoBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#E8EFE9', alignItems: 'center' },
  tipoGastoActivo: { backgroundColor: '#C94A4A' },
  tipoIngresoActivo: { backgroundColor: '#2D6A4F' },
  tipoBtnTxt: { fontSize: 14, fontWeight: '700', color: '#2D3748' },
  txtBlanco: { color: '#FFFFFF' },
  label: { fontSize: 12, fontWeight: '600', color: '#52725F', marginTop: 6, marginBottom: 4 },
  labelSub: { fontSize: 11, fontWeight: '600', color: '#718078', marginBottom: 2 },
  chipsScroll: { marginBottom: 10 },
  chip: { backgroundColor: '#E8EFE9', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8 },
  chipActivo: { backgroundColor: '#205B43' },
  chipTxt: { fontSize: 12, color: '#205B43', fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAF8',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DCE5DB',
    fontSize: 14,
    color: '#1F2937',
    marginVertical: 4,
  },
  btnPrincipal: { backgroundColor: '#205B43', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  btnPrincipalTxt: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  itemMov: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  conceptoMov: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  metaMov: { fontSize: 11, color: '#718078', marginTop: 2 },
  montoIngreso: { fontSize: 14, fontWeight: '700', color: '#2D6A4F' },
  montoGasto: { fontSize: 14, fontWeight: '700', color: '#C94A4A' },

  explicacion: { fontSize: 13, color: '#52725F', marginBottom: 14, lineHeight: 18 },
  btnNuevaCuenta: { backgroundColor: '#2D6A4F', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  btnNuevaCuentaTxt: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  cardCuentaCompleta: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginVertical: 8, elevation: 2 },
  nombreCuenta: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  tipoCuentaTexto: { fontSize: 12, color: '#718078' },
  labelSaldo: { fontSize: 11, color: '#718078' },
  saldoActualMonto: { fontSize: 16, fontWeight: '700', color: '#205B43' },
  divider: { height: 1, backgroundColor: '#EEF2EE', marginVertical: 12 },
  labelInit: { fontSize: 10, fontWeight: '700', color: '#718078', letterSpacing: 0.5 },
  montoInit: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginTop: 2 },
  btnEditarSaldo: { backgroundColor: '#E8EFE9', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnEditarSaldoTxt: { fontSize: 12, fontWeight: '700', color: '#205B43' },
  btnReiniciar: {
    marginTop: 18,
    padding: 12,
    backgroundColor: '#FDE8E8',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  btnReiniciarTxt: { color: '#9B1C1C', fontWeight: '700', fontSize: 13 },

  filtroCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginVertical: 10, elevation: 2 },
  inputFecha: {
    backgroundColor: '#F8FAF8',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DCE5DB',
    fontSize: 13,
    color: '#1F2937',
  },
  resumenPeriodoCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginVertical: 8, elevation: 2 },
  resumenLabel: { fontSize: 11, fontWeight: '700', color: '#718078' },
  resumenMontoGasto: { fontSize: 26, fontWeight: '800', color: '#C94A4A', marginVertical: 6 },
  resumenDetalles: { borderTopWidth: 1, borderTopColor: '#EEF2EE', paddingTop: 8, gap: 4 },
  resumenDetalleTxt: { fontSize: 12, color: '#52725F', fontWeight: '600' },
  graficoBox: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 8 },
  barraSegmentada: { height: 16, flexDirection: 'row', borderRadius: 8, overflow: 'hidden', backgroundColor: '#E2E8F0' },
  textoVacio: { textAlign: 'center', color: '#718078', marginVertical: 24, fontStyle: 'italic' },

  modalFondo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCaja: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20 },
  modalTitulo: { fontSize: 18, fontWeight: '800', color: '#1B4332', marginBottom: 10, textAlign: 'center' },

  barraNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: 6,
  },
  navBtn: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  navIcono: { fontSize: 20, opacity: 0.4 },
  navActivo: { opacity: 1 },
  navTexto: { fontSize: 11, fontWeight: '600', color: '#718078', marginTop: 2 },
  navTextoActivo: { color: '#205B43', fontWeight: '800' },
});
