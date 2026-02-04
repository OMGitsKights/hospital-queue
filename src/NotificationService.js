// Notification service for real-time queue alerts
export class NotificationService {
  static requestPermission() {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        return Promise.resolve();
      } else if (Notification.permission !== "denied") {
        return Notification.requestPermission();
      }
    }
    return Promise.resolve();
  }

  static sendNotification(title, options = {}) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        icon: "🏥",
        badge: "🏥",
        ...options,
      });
    }
  }

  static notifyQueueReduced(count, language = "en") {
    const messages = {
      en: `Queue reduced! Only ${count} patients ahead now.`,
      hi: `कतार कम हो गई! अब केवल ${count} रोगी आगे हैं।`,
      te: `వరుస తగ్గింది! ఇప్పుడు ${count} రోగులు ముందున్నారు।`,
    };
    this.sendNotification(messages[language] || messages.en, {
      tag: "queue-update",
    });
  }

  static notifySlotApproaching(minutes, language = "en") {
    const messages = {
      en: `Your appointment is in ${minutes} minutes!`,
      hi: `आपकी अपॉइंटमेंट ${minutes} मिनट में है!`,
      te: `మీ నియామకం ${minutes} నిమిషాలలో ఉంది!`,
    };
    this.sendNotification(messages[language] || messages.en, {
      tag: "appointment-soon",
      requireInteraction: true,
    });
  }

  static startQueueMonitor(hospital, department, date, onQueueChange, language = "en") {
    const BACKEND_URL = "http://localhost:5001";
    let lastCount = null;

    const monitor = setInterval(async () => {
      try {
        const url = new URL(`${BACKEND_URL}/queues`);
        url.searchParams.append("date", date);
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data = await res.json();
        const hosp = data[hospital] || {};
        const dept = hosp[department] || { morning: 0, afternoon: 0 };
        const currentCount = dept.morning + dept.afternoon;

        if (lastCount !== null && currentCount < lastCount) {
          this.notifyQueueReduced(currentCount, language);
          if (typeof onQueueChange === "function") {
            onQueueChange(currentCount);
          }
        }
        lastCount = currentCount;
      } catch (err) {
        console.error("Queue monitor error:", err);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(monitor);
  }
}
