export interface PredefinedSchedule {
  label: string;
  diaClase: string;
  horaInicio: string;
  horaFin: string;
}

export const PREDEFINED_SCHEDULES: PredefinedSchedule[] = [
  {
    label: "Lunes a Viernes | 7:15 am – 8:45 am",
    diaClase: "Lunes a Viernes",
    horaInicio: "07:15",
    horaFin: "08:45",
  },
  {
    label: "Lunes a Viernes | 9:00 am – 10:30 am",
    diaClase: "Lunes a Viernes",
    horaInicio: "09:00",
    horaFin: "10:30",
  },
  {
    label: "Lunes a Viernes | 10:45 am – 12:15 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "10:45",
    horaFin: "12:15",
  },
  {
    label: "Lunes a Viernes | 12:30 pm – 2:00 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "12:30",
    horaFin: "14:00",
  },
  {
    label: "Lunes a Viernes | 2:10 pm – 3:40 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "14:10",
    horaFin: "15:40",
  },
  {
    label: "Lunes a Viernes | 3:50 pm – 5:20 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "15:50",
    horaFin: "17:20",
  },
  {
    label: "Lunes a Viernes | 5:30 pm – 7:00 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "17:30",
    horaFin: "19:00",
  },
  {
    label: "Lunes a Viernes | 7:15 pm – 8:45 pm",
    diaClase: "Lunes a Viernes",
    horaInicio: "19:15",
    horaFin: "20:45",
  },
  {
    label: "Sábados | 9:00 am – 2:00 pm",
    diaClase: "Sábados",
    horaInicio: "09:00",
    horaFin: "14:00",
  },
  {
    label: "Sábados | 2:30 pm – 7:30 pm",
    diaClase: "Sábados",
    horaInicio: "14:30",
    horaFin: "19:30",
  },
];
