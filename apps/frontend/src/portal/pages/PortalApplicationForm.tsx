import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Send, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { ApiError } from '@/lib/api';
import { useApplication, useCreateApplication, useUpdateApplication, useSignApplication } from '../portalApi';
import { SignaturePad, type SignaturePadHandle } from '../SignaturePad';
import { StatusBadge } from '../StatusBadge';
import { DETAIL_FIELDS } from '../applicationSteps';
import { APPLICATION_TYPE_LABELS, type ApplicationType } from '@ala/types';
import { formatDate } from '@/lib/format';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-[0.95rem] text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

const TYPES = Object.keys(APPLICATION_TYPE_LABELS) as ApplicationType[];
const STEPS = ['Programme', 'Details', 'Review'];

export function PortalApplicationForm() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const { data: loaded, isLoading } = useApplication(isNew ? undefined : id);
  const create = useCreateApplication();
  const update = useUpdateApplication();
  const sign = useSignApplication();
  const padRef = useRef<SignaturePadHandle>(null);
  const [signedName, setSignedName] = useState('');

  const [appId, setAppId] = useState<string | undefined>(isNew ? undefined : id);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<ApplicationType>('study_abroad');
  const [title, setTitle] = useState('');
  const [data, setData] = useState<Record<string, unknown>>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (loaded) {
      setAppId(loaded.id);
      setType(loaded.type as ApplicationType);
      setTitle(loaded.title);
      setData(loaded.data ?? {});
    }
  }, [loaded]);

  const fields = useMemo(() => DETAIL_FIELDS[type] ?? [], [type]);
  const editable = isNew || loaded?.status === 'draft';

  if (!isNew && isLoading) {
    return <div className="flex justify-center py-16"><Spinner className="h-6 w-6 text-ala-navy" /></div>;
  }

  // Read-only view for submitted / in-review / decided applications.
  if (!editable && loaded) {
    return <ReadOnlyApplication app={loaded} />;
  }

  const progressForStep = (s: number) => [20, 60, 90][s] ?? 20;

  const persist = async (overrides?: { status?: 'submitted' }) => {
    setError('');
    if (!title.trim()) {
      setStep(0);
      throw new Error('Please give your application a title.');
    }
    if (appId) {
      await update.mutateAsync({
        id: appId,
        body: { title: title.trim(), data, progress: progressForStep(step), ...overrides },
      });
      return appId;
    }
    const createdApp = await create.mutateAsync({
      type,
      title: title.trim(),
      data,
      progress: progressForStep(step),
    });
    setAppId(createdApp.id);
    // Reflect the new id in the URL without a full reload.
    navigate(`/portal/applications/${createdApp.id}`, { replace: true });
    if (overrides?.status) {
      await update.mutateAsync({ id: createdApp.id, body: { status: 'submitted' } });
    }
    return createdApp.id;
  };

  const saveDraft = async () => {
    try {
      await persist();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
    }
  };

  const signSubmit = async () => {
    setError('');
    if (!signedName.trim()) return setError('Please type your full name to sign.');
    if (padRef.current?.isEmpty()) return setError('Please draw your signature above.');
    try {
      const savedId = await persist(); // ensure the application exists + latest data saved
      await sign.mutateAsync({
        id: savedId,
        signature: padRef.current!.toDataURL(),
        signed_name: signedName.trim(),
      });
      navigate('/portal/applications');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : (e as Error).message);
    }
  };

  const busy = create.isPending || update.isPending || sign.isPending;

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/portal/applications" className="mb-4 inline-flex items-center gap-1 text-sm text-ala-grey-500 hover:text-ala-navy">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <h1 className="font-heading text-2xl font-bold text-ala-navy">
        {isNew ? 'New application' : 'Edit application'}
      </h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                i < step ? 'bg-emerald-600 text-white' : i === step ? 'bg-ala-navy text-white' : 'bg-ala-grey-200 text-ala-grey-500',
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <span className={cn('text-sm', i === step ? 'font-semibold text-ala-navy' : 'text-ala-grey-500')}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px flex-1 bg-ala-grey-200" />}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-ala-grey-200 bg-white p-6">
        {/* Step 0 — programme + title */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <p className="mb-2 text-sm font-medium text-ala-navy">What are you applying for?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {TYPES.map((tp) => (
                  <button
                    key={tp}
                    type="button"
                    disabled={!isNew}
                    onClick={() => setType(tp)}
                    className={cn(
                      'rounded-card border p-3 text-left text-sm font-medium transition-colors disabled:opacity-60',
                      type === tp ? 'border-ala-navy bg-ala-navy/5 text-ala-navy' : 'border-ala-grey-200 text-ala-grey-500 hover:border-ala-navy/40',
                    )}
                  >
                    {APPLICATION_TYPE_LABELS[tp]}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ala-navy">Application title</span>
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Master's in Canada — Fall 2027" />
            </label>
          </div>
        )}

        {/* Step 1 — details */}
        {step === 1 && (
          <div className="space-y-4">
            {fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1.5 block text-sm font-medium text-ala-navy">{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea rows={3} className={cn(inputCls, 'h-auto py-2.5')} value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
                ) : f.type === 'select' ? (
                  <select className={inputCls} value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })}>
                    <option value="">—</option>
                    {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className={inputCls} value={(data[f.key] as string) ?? ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} />
                )}
              </label>
            ))}
          </div>
        )}

        {/* Step 2 — review */}
        {step === 2 && (
          <div>
            <h2 className="font-heading text-lg font-semibold text-ala-navy">Review your application</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Programme" value={APPLICATION_TYPE_LABELS[type]} />
              <Row label="Title" value={title} />
              {fields.map((f) => (
                <Row key={f.key} label={f.label} value={(data[f.key] as string) || '—'} />
              ))}
            </dl>
            <p className="mt-4 rounded-btn bg-ala-navy/5 p-3 text-xs text-ala-grey-500">
              After submitting, an ALA advisor will review your application. You can still upload supporting
              documents from the Documents tab.
            </p>

            {/* Digital signature */}
            <div className="mt-6 border-t border-ala-grey-100 pt-5">
              <h3 className="font-heading font-semibold text-ala-navy">Sign to submit</h3>
              <p className="mt-1 text-xs text-ala-grey-500">
                By signing, you confirm the information above is accurate.
              </p>
              <label className="mt-3 block">
                <span className="mb-1.5 block text-sm font-medium text-ala-navy">Full legal name</span>
                <input className={inputCls} value={signedName} onChange={(e) => setSignedName(e.target.value)} placeholder="Type your full name" />
              </label>
              <div className="mt-3">
                <span className="mb-1.5 block text-sm font-medium text-ala-navy">Signature</span>
                <SignaturePad ref={padRef} />
              </div>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-ala-red">{error}</p>}

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ala-grey-100 pt-5">
          <div>
            {step > 0 && (
              <Button type="button" variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline-navy" onClick={saveDraft} disabled={busy}>
              <Save className="h-4 w-4" /> {busy ? 'Saving…' : 'Save draft'}
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={() => setStep(step + 1)}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="button" onClick={signSubmit} disabled={busy}>
                <Send className="h-4 w-4" /> {busy ? 'Submitting…' : 'Sign & submit'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-ala-grey-100 py-1.5">
      <dt className="text-ala-grey-500">{label}</dt>
      <dd className="text-right font-medium text-ala-navy">{value}</dd>
    </div>
  );
}

function ReadOnlyApplication({ app }: { app: import('@ala/types').Application }) {
  const fields = DETAIL_FIELDS[app.type as ApplicationType] ?? [];
  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/portal/applications" className="mb-4 inline-flex items-center gap-1 text-sm text-ala-grey-500 hover:text-ala-navy">
        <ArrowLeft className="h-4 w-4" /> Back to applications
      </Link>
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">{app.title}</h1>
        <StatusBadge status={app.status} />
      </div>
      <p className="mt-1 text-sm text-ala-grey-500">
        {APPLICATION_TYPE_LABELS[app.type as ApplicationType]} · {app.ref}
        {app.submitted_at ? ` · Submitted ${formatDate(app.submitted_at)}` : ''}
      </p>

      <div className="mt-6 rounded-card border border-ala-grey-200 bg-white p-6">
        <dl className="space-y-2 text-sm">
          {fields.map((f) => (
            <Row key={f.key} label={f.label} value={(app.data?.[f.key] as string) || '—'} />
          ))}
        </dl>
        {app.signature_url && (
          <div className="mt-5 border-t border-ala-grey-100 pt-4">
            <p className="text-xs font-medium text-ala-grey-500">Signed by {app.signed_name}</p>
            <img src={app.signature_url} alt="Signature" className="mt-1 h-20 rounded border border-ala-grey-200 bg-white" />
          </div>
        )}
        {app.notes && (
          <div className="mt-5 rounded-btn bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-semibold">Advisor note</p>
            <p className="mt-1">{app.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
