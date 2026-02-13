/**
 * Video Interview Service - integrates with Daily.co for virtual interviews
 * Get free API key at https://dashboard.daily.co/
 * Alternative: Use Jitsi Meet (free, no API key) - uncomment Jitsi section below
 */

export const createVideoMeeting = async (interviewId, scheduledAt, duration = 30) => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) {
    // Fallback: return Jitsi room URL (no API key needed)
    const roomName = `placement-interview-${interviewId}-${Date.now()}`;
    return {
      url: `https://meet.jit.si/${roomName}`,
      meetingId: roomName,
      meetingPassword: null,
      provider: 'jitsi',
    };
  }

  try {
    const res = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        name: `interview-${interviewId}-${Date.now()}`,
        properties: {
          exp: Math.floor(scheduledAt.getTime() / 1000) + (duration + 60) * 60,
          enable_chat: true,
          enable_screenshare: true,
          start_video_off: false,
        },
      }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return {
      url: data.url,
      meetingId: data.name,
      meetingPassword: null,
      provider: 'daily',
    };
  } catch (error) {
    // Fallback to Jitsi
    const roomName = `placement-${interviewId}-${Date.now()}`;
    return {
      url: `https://meet.jit.si/${roomName}`,
      meetingId: roomName,
      meetingPassword: null,
      provider: 'jitsi',
    };
  }
};

export const deleteVideoMeeting = async (meetingId) => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey || !meetingId?.startsWith('interview-')) return;
  try {
    await fetch(`https://api.daily.co/v1/rooms/${meetingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${apiKey}` },
    });
  } catch (e) {
    console.warn('Could not delete Daily room:', e.message);
  }
};
