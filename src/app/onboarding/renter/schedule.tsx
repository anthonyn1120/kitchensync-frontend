import { StepScreen } from '@/components/onboarding/StepScreen';
import { FadeUp } from '@/components/onboarding/FadeUp';
import { OptionGrid } from '@/components/onboarding/OptionGrid';
import { DayGrid, FormSection, StepperRow } from '@/components/onboarding/Controls';
import { timeOfDayOptions } from '@/components/onboarding/options';
import { exitRefine, refineLabel } from '@/components/onboarding/steps';
import { useAppState } from '@/store/AppState';

/** Sharpen results 3/3 — preferred days, time of day, weekly hours and max rate. Ends back on Find Space. */
export default function RenterSchedule() {
  const { renterPrefs, updateRenterPrefs, markPrefsRefined } = useAppState();
  const { days, timeOfDay, hoursPerWeek, budgetPerHour } = renterPrefs;
  const canContinue = days.length > 0 && timeOfDay.length > 0;

  return (
    <StepScreen
      label={refineLabel(3)}
      title="When do you want to cook?"
      subtitle="Your usual days and times. You can change this anytime."
      continueLabel="Update results"
      canContinue={canContinue}
      onContinue={() => {
        updateRenterPrefs({ days, timeOfDay, hoursPerWeek, budgetPerHour });
        markPrefsRefined();
        exitRefine();
      }}
    >
      <FadeUp stagger={2}>
        <FormSection label="Days">
          <DayGrid selected={days} onChange={(next) => updateRenterPrefs({ days: next })} />
        </FormSection>
      </FadeUp>

      <FadeUp stagger={3}>
        <FormSection label="Time of day">
          <OptionGrid
            compact
            options={timeOfDayOptions}
            values={timeOfDay}
            onChange={(v) =>
              updateRenterPrefs({ timeOfDay: timeOfDay.includes(v) ? timeOfDay.filter((t) => t !== v) : [...timeOfDay, v] })
            }
          />
        </FormSection>
      </FadeUp>

      <FadeUp stagger={4}>
        <StepperRow
          label="Hours a week"
          value={hoursPerWeek}
          min={2}
          max={60}
          step={2}
          format={(v) => `${v} hrs`}
          onChange={(v) => updateRenterPrefs({ hoursPerWeek: v })}
        />
        <StepperRow
          label="Max rate"
          value={budgetPerHour}
          min={20}
          max={150}
          step={5}
          format={(v) => `$${v}/hr`}
          onChange={(v) => updateRenterPrefs({ budgetPerHour: v })}
        />
      </FadeUp>
    </StepScreen>
  );
}
