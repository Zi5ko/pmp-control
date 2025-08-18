const permissions = {
    administrador: [
      "ver_calendario",
      "registrar_mantenimiento",
      "subir_evidencia",
      "validar_mantenimiento",
      "solicitar_correccion",
      "planificar_mantenimiento",
      "calendarizar_mantenimiento",
      "registrar_equipos",
      "gestionar_usuarios",
      "configurar_alertas",
      "generar_reportes",
      "auditar"
    ],
    tecnico: [
      "ver_calendario",
      "registrar_mantenimiento",
      "subir_evidencia"
    ],
    supervisor: [
      "ver_calendario",
      "validar_mantenimiento",
      "solicitar_correccion"
    ],
    esmp: [
      "ver_calendario",
      "planificar_mantenimiento",
      "calendarizar_mantenimiento",
      "registrar_equipos",
      "gestionar_usuarios",
      "configurar_alertas",
      "generar_reportes"
    ],
    responsable_institucional: [
      "ver_calendario",
      "planificar_mantenimiento",
      "calendarizar_mantenimiento",
      "gestionar_usuarios",
      "generar_reportes",
      "auditar"
    ],
    calidad: [
      "ver_calendario",
      "auditar"
    ]
  };
  
  export default permissions;