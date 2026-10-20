'use client';

import { useActionState } from 'react';

import { createConversation } from './actions';

const inputClasses =
  'w-full rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-fg ' +
  'focus:outline-none focus:ring-2 focus:ring-accent transition';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] ' +
  'px-6 py-3 font-semibold text-accent-fg shadow-soft transition disabled:opacity-70 disabled:cursor-not-allowed';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState(createConversation, null);

  if (state?.ok) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-cacao">
          Message envoyé. Patricia vous répondra personnellement, généralement sous 24 heures
          ouvrées.
        </p>
        <button
          onClick={() => window.location.reload()}
          className={`${btnBase} bg-accent hover:bg-accent-hover`}
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {/* Honeypot : invisible pour les humains, rempli par les bots. */}
      <input
        name="website"
        type="text"
        aria-hidden="true"
        autoComplete="off"
        tabIndex={-1}
        style={{ display: 'none' }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-fg">
            Nom
          </label>
          <input
            id="name"
            placeholder="Votre nom et prénom"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            autoComplete="name"
            className={inputClasses}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-fg">
            E-mail
          </label>
          <input
            id="email"
            placeholder="vous@exemple.com"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            className={inputClasses}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="phone" className="text-sm font-medium text-fg">
            Téléphone (facultatif)
          </label>
          <input
            id="phone"
            placeholder="+221 77 123 45 67"
            name="phone"
            type="tel"
            maxLength={30}
            autoComplete="tel"
            className={inputClasses}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="subject" className="text-sm font-medium text-fg">
            Sujet
          </label>
          <input
            id="subject"
            placeholder="Objet de votre message"
            name="subject"
            type="text"
            required
            minLength={3}
            maxLength={200}
            className={inputClasses}
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label htmlFor="message" className="text-sm font-medium text-fg">
            Message
          </label>
          <textarea
            id="message"
            placeholder="Écrivez votre message ici…"
            name="message"
            required
            minLength={10}
            maxLength={2000}
            rows={5}
            autoComplete="off"
            className={`${inputClasses} resize-y`}
          />
        </div>
      </div>

      {state?.error && <p className="text-sm font-medium text-alert">{state.error}</p>}

      <button
        disabled={isPending}
        className={`${btnBase} bg-accent hover:bg-accent-hover active:scale-[0.98]`}
      >
        {isPending ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>
    </form>
  );
}
