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
    if (!c) return
