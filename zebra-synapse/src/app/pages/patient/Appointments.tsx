import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Stethoscope,
  Video,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  PatientPageHero,
  PatientPortalPage,
  StatusPill,
  portalDangerButtonClass,
  portalDialogClass,
  portalInputClass,
  portalMutedPanelClass,
  portalPrimaryButtonClass,
  portalSecondaryButtonClass,
  portalSelectContentClass,
  portalSelectItemClass,
  portalSelectTriggerClass,
} from "../../components/patient/PortalTheme";

function formatDisplayDate(date: string) {
  try {
    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return date;
  }
}

export default function Appointments() {
  const [open, setOpen] = useState(false);

  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2026-04-10",
      time: "10:00 AM",
      type: "video",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Endocrinologist",
      date: "2026-04-15",
      time: "2:30 PM",
      type: "in-person",
      location: "Zebra Medical Center, Floor 3",
      status: "confirmed",
    },
  ];

  const pastAppointments = [
    {
      id: 3,
      doctor: "Dr. Emily Williams",
      specialty: "General Physician",
      date: "2026-03-20",
      time: "11:00 AM",
      type: "in-person",
      status: "completed",
    },
    {
      id: 4,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2026-02-14",
      time: "9:30 AM",
      type: "video",
      status: "completed",
    },
  ];

  return (
    <PatientPortalPage>
      <PatientPageHero
        eyebrow="Care Coordination"
        title="Appointments"
        description="Manage upcoming visits, keep your follow-ups visible, and keep every appointment in the same premium workspace as the rest of your health portal."
        icon={Calendar}
        meta={[
          { label: "Upcoming", value: upcomingAppointments.length },
          { label: "Completed", value: pastAppointments.length },
        ]}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className={portalPrimaryButtonClass}>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className={portalDialogClass}>
              <DialogHeader>
                <DialogTitle className="text-white">Schedule New Appointment</DialogTitle>
                <DialogDescription className="text-[#A1A1AA]">
                  Choose a doctor and preferred time for your appointment.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="doctor" className="text-sm text-white">
                    Select Doctor
                  </Label>
                  <Select>
                    <SelectTrigger id="doctor" className={portalSelectTriggerClass}>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent className={portalSelectContentClass}>
                      <SelectItem value="sarah" className={portalSelectItemClass}>
                        Dr. Sarah Johnson - Cardiologist
                      </SelectItem>
                      <SelectItem value="michael" className={portalSelectItemClass}>
                        Dr. Michael Chen - Endocrinologist
                      </SelectItem>
                      <SelectItem value="emily" className={portalSelectItemClass}>
                        Dr. Emily Williams - General Physician
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm text-white">
                    Date
                  </Label>
                  <Input id="date" type="date" className={portalInputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time" className="text-sm text-white">
                    Time
                  </Label>
                  <Input id="time" type="time" className={portalInputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm text-white">
                    Appointment Type
                  </Label>
                  <Select>
                    <SelectTrigger id="type" className={portalSelectTriggerClass}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className={portalSelectContentClass}>
                      <SelectItem value="video" className={portalSelectItemClass}>
                        Video Consultation
                      </SelectItem>
                      <SelectItem value="in-person" className={portalSelectItemClass}>
                        In-Person Visit
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className={`w-full ${portalPrimaryButtonClass}`} onClick={() => setOpen(false)}>
                  Confirm Appointment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Upcoming Appointments</h2>
              <p className="mt-1 text-sm text-[#A1A1AA]">Next visits that still need your attention.</p>
            </div>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-[1.5rem] border border-white/8 bg-[rgba(255,255,255,0.03)] p-6 text-white shadow-[0_22px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#ff6a00]/30 hover:shadow-[0_28px_80px_rgba(255,106,0,0.12)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#6C5BD4] to-[#3b82f6] shadow-[0_12px_32px_rgba(108,91,212,0.28)]">
                      <Stethoscope className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-white">{appointment.doctor}</h3>
                        <StatusPill status={appointment.status} />
                      </div>
                      <p className="mt-1 text-sm text-[#A1A1AA]">{appointment.specialty}</p>
                    </div>
                  </div>
                  <div className={portalMutedPanelClass}>
                    <div className="grid gap-3 px-4 py-3 text-sm text-[#E5E7EB] sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#ff9c61]" />
                        <span>{formatDisplayDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#ff9c61]" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.type === "video" ? (
                          <>
                            <Video className="h-4 w-4 text-[#8f83ff]" />
                            <span>Video Consultation</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 text-[#8f83ff]" />
                            <span>{appointment.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  {appointment.type === "video" ? (
                    <Button className={portalPrimaryButtonClass}>Join Video Call</Button>
                  ) : null}
                  <Button variant="outline" className={portalSecondaryButtonClass}>
                    Reschedule
                  </Button>
                  <Button variant="outline" className={portalDangerButtonClass}>
                    Cancel
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Past Appointments</h2>
            <p className="mt-1 text-sm text-[#A1A1AA]">Completed visits and visit history.</p>
          </div>
          <div className="space-y-4">
            {pastAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-[1.5rem] border border-white/8 bg-[#171717]/90 p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Stethoscope className="h-5 w-5 text-white/70" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{appointment.doctor}</h3>
                      <p className="mt-1 text-sm text-[#A1A1AA]">{appointment.specialty}</p>
                    </div>
                  </div>
                  <StatusPill status={appointment.status} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[#D4D4D8] sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#ff9c61]" />
                    <span>{formatDisplayDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#ff9c61]" />
                    <span>{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.type === "video" ? (
                      <>
                        <Video className="h-4 w-4 text-[#8f83ff]" />
                        <span>Video Consultation</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-[#8f83ff]" />
                        <span>In-Person</span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" className={`mt-5 ${portalSecondaryButtonClass}`}>
                  View Notes
                </Button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </PatientPortalPage>
  );
}
