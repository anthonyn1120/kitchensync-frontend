import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { PillButton } from '@/components/ui';
import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import { TextLink } from '@/components/onboarding/Controls';
import { DocRow, PickedDoc, StructuringView, VoiceRecorder } from '@/components/onboarding/ListingCreation';
import { generatedDescription, ListingMethod, listingMethodOptions, sampleDocuments } from '@/components/onboarding/options';
import { HOST_STEPS } from '@/components/onboarding/steps';
import { useAppState } from '@/store/AppState';

type Phase = 'choose' | ListingMethod | 'structuring';

/** Host step 2 — create the listing from files or a voice description, then structure it. */
export default function HostListing() {
  const { updateHostSetup } = useAppState();
  const [phase, setPhase] = useState<Phase>('choose');
  const [method, setMethod] = useState<ListingMethod | null>(null);
  const [source, setSource] = useState<ListingMethod>('upload');
  const [docs, setDocs] = useState<PickedDoc[]>([]);
  const [voice, setVoice] = useState({ text: '', finished: false });
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const addDocs = (files: { name: string; size?: number }[]) => {
    const added: PickedDoc[] = files.map((f, i) => ({
      id: `${Date.now()}-${i}-${f.name}`,
      name: f.name,
      size: f.size,
      status: 'analyzing',
    }));
    setDocs((d) => [...d, ...added]);
    added.forEach((doc, i) => {
      timers.current.push(
        setTimeout(() => {
          setDocs((d) => d.map((x) => (x.id === doc.id ? { ...x, status: 'done' } : x)));
        }, 1200 + i * 500),
      );
    });
  };

  const pickFiles = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        multiple: true,
        type: ['application/pdf', 'image/*', 'text/*', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        copyToCacheDirectory: false,
      });
      if (res.canceled) return;
      addDocs(res.assets.map((a) => ({ name: a.name, size: a.size ?? undefined })));
    } catch {
      // Picker unavailable (e.g. simulator without Files) — fall back to samples.
      addDocs(sampleDocuments.map((name) => ({ name })));
    }
  };

  const addSamples = () => addDocs(sampleDocuments.map((name) => ({ name })));

  const startStructuring = (from: ListingMethod) => {
    setSource(from);
    setPhase('structuring');
  };

  const finishStructuring = () => {
    updateHostSetup({ listingSource: source, description: generatedDescription });
    router.push('/onboarding/host/review');
    // Coming back should land on the finished upload/voice state, not the loader.
    setTimeout(() => setPhase(source), 400);
  };

  const back = () => {
    if (phase === 'structuring') setPhase(source);
    else if (phase !== 'choose') setPhase('choose');
    else router.back();
  };

  const allRead = docs.length > 0 && docs.every((d) => d.status === 'done');
  const copy: Record<Phase, { title: string; subtitle?: string }> = {
    choose: {
      title: 'Create your listing',
      subtitle: 'Upload your paperwork or just describe your kitchen out loud. Our AI fills in the listing.',
    },
    upload: { title: 'Add your files', subtitle: 'Equipment lists, inspection reports, menus. Whatever you have.' },
    voice: { title: 'Describe your kitchen', subtitle: 'Mention your equipment, when it’s free, and any allergen rules.' },
    structuring: { title: 'Building your listing' },
  };

  const footer = (() => {
    switch (phase) {
      case 'choose':
        return { label: 'Continue', can: !!method, go: () => method && setPhase(method) };
      case 'upload':
        return { label: 'Build my listing', can: allRead, go: () => startStructuring('upload') };
      case 'voice':
        return { label: 'Build my listing', can: voice.finished && voice.text.length > 60, go: () => startStructuring('voice') };
      default:
        return null;
    }
  })();

  return (
    <StepScreen
      step={2}
      total={HOST_STEPS}
      onBack={back}
      title={copy[phase].title}
      subtitle={copy[phase].subtitle}
      hideFooter={!footer}
      continueLabel={footer?.label}
      canContinue={footer?.can}
      onContinue={footer?.go}
    >
      {phase === 'choose' && (
        <>
          <FadeUp stagger={2}>
            <OptionGrid options={listingMethodOptions} value={method} onChange={setMethod} />
          </FadeUp>
          <FadeUp stagger={3} style={{ alignItems: 'center', marginTop: 24 }}>
            <TextLink
              label="Fill it in myself"
              style={{ alignSelf: 'center' }}
              onPress={() => {
                updateHostSetup({ listingSource: 'manual', description: '' });
                router.push('/onboarding/host/review');
              }}
            />
          </FadeUp>
        </>
      )}

      {phase === 'upload' && (
        <FadeUp key="upload" stagger={2}>
          {docs.map((d) => (
            <DocRow key={d.id} doc={d} onRemove={() => setDocs((all) => all.filter((x) => x.id !== d.id))} />
          ))}
          <View style={{ marginTop: docs.length ? 10 : 0, gap: 12, alignItems: 'center' }}>
            <PillButton label={docs.length ? 'Add more files' : 'Choose files'} size="lg" fullWidth onPress={pickFiles} />
            {docs.length === 0 && (
              <TextLink
                label="Use sample files"
                style={{ alignSelf: 'center' }}
                onPress={addSamples}
              />
            )}
          </View>
        </FadeUp>
      )}

      {phase === 'voice' && (
        <FadeUp key="voice" stagger={2}>
          <VoiceRecorder initialText={voice.finished ? voice.text : ''} onTranscript={(text, finished) => setVoice({ text, finished })} />
        </FadeUp>
      )}

      {phase === 'structuring' && <StructuringView source={source} onDone={finishStructuring} />}
    </StepScreen>
  );
}
