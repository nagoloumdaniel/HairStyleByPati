import { describe, expect, it } from 'vitest';
import { notificationTemplateExists, renderNotification } from './templates';

const appointment = {
  kind: 'appointment',
  appointmentId: 'appt-1',
  customerName: 'Amina <Test>',
  customerEmail: 'amina@example.com',
  serviceName: 'Tresses BOX',
  startsAt: '2026-10-22T08:00:00.000Z',
  status: 'CONFIRMED',
  cancelUrl: 'https://example.test/annulation/abc',
};

describe('renderNotification', () => {
  it('should render a confirmation email with date, service and secure link', () => {
    const rendered = renderNotification('booking_confirmed', appointment);
    expect(rendered?.subject).toContain('confirmé');
    expect(rendered?.html).toContain('Tresses BOX');
    expect(rendered?.html).toContain('https://example.test/annulation/abc');
    expect(rendered?.text).toContain('Amina');
  });

  it('should escape HTML from user-controlled values', () => {
    const rendered = renderNotification('booking_confirmed', appointment);
    expect(rendered?.html).not.toContain('<Test>');
    expect(rendered?.html).toContain('Amina &lt;Test&gt;');
  });

  it('should render an admin contact notification with a dashboard link', () => {
    const rendered = renderNotification('admin_contact_message', {
      kind: 'conversation',
      conversationId: 'conv-1',
      customerName: 'Amina',
      customerEmail: 'amina@example.com',
      subject: 'Question sur les tresses',
      message: 'Bonjour, je souhaite un devis.',
      adminLink: '/dashboard/messages/conv-1',
    });
    expect(rendered?.subject).toContain('Question sur les tresses');
    expect(rendered?.html).toContain('/dashboard/messages/conv-1');
    expect(rendered?.text).toContain('devis');
  });

  it('should render a custom request decision with price and proposed slot', () => {
    const rendered = renderNotification('custom_request_decision', {
      kind: 'custom',
      requestId: 'request-1',
      requesterName: 'Amina',
      requesterEmail: 'amina@example.com',
      description: 'Tresses personnalisées pour un mariage.',
      adminReply: 'Votre projet est réalisable.',
      estimatedPriceCents: 1500000,
      proposedServiceName: 'Tresses BOX',
      proposedSlot: '2026-11-20T09:00:00.000Z',
    });
    expect(rendered?.subject).toContain('demande');
    expect(rendered?.html).toMatch(/15[\s  ]000/);
    expect(rendered?.html).toContain('Tresses BOX');
    expect(rendered?.html).toContain('/reserver');
  });

  it('should return null for an unknown template or an empty payload', () => {
    expect(renderNotification('unknown_template', appointment)).toBeNull();
    expect(renderNotification('booking_confirmed', null)).toBeNull();
  });

  it('should know the supported templates', () => {
    expect(notificationTemplateExists('booking_reminder')).toBe(true);
    expect(notificationTemplateExists('conversation_reply')).toBe(true);
    expect(notificationTemplateExists('custom_request_decision')).toBe(true);
    expect(notificationTemplateExists('autre')).toBe(false);
  });
});
