import { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { PageTitle, Screen } from '@/components/ui';
import { EditListingSheet } from '@/components/host/EditListingSheet';
import { FadeUp } from '@/components/host/FadeUp';
import { ListingSummary } from '@/components/host/ListingSummary';
import { computeOpenSlots } from '@/components/host/openSlots';
import { RenterRequests, type RenterRequestsHandle } from '@/components/host/RenterRequests';
import { RequestBanner } from '@/components/host/RequestBanner';
import { StorageUtilization } from '@/components/host/StorageUtilization';
import { TodaySchedule } from '@/components/host/TodaySchedule';
import { useToast } from '@/components/host/Toast';
import { WeekHero } from '@/components/host/WeekHero';
import { hostListing } from '@/data/mock';
import { useAppState } from '@/store/AppState';

/** The request the demo "notification" announces. */
const BANNER_REQUEST_ID = 'r2';
const BANNER_DELAY_MS = 1200;
/** The banner shows once per app session. */
let bannerShown = false;

export default function HostDashboard() {
  const { hostSetup, updateHostSetup, requests, bookings } = useAppState();
  const toast = useToast();
  const requestsRef = useRef<RenterRequestsHandle>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [active, setActive] = useState(true);

  const slots = useMemo(
    () =>
      computeOpenSlots({
        days: hostSetup.days,
        hours: hostSetup.hours,
        bookings,
        requests,
        listingId: hostListing.id,
      }),
    [hostSetup.days, hostSetup.hours, bookings, requests],
  );

  // In-app notification for a new request, shortly after the dashboard first opens.
  const bannerRequest = requests.find((r) => r.id === BANNER_REQUEST_ID && r.status === 'pending');
  const [bannerVisible, setBannerVisible] = useState(false);
  useEffect(() => {
    if (bannerShown) return;
    const t = setTimeout(() => {
      bannerShown = true;
      setBannerVisible(true);
    }, BANNER_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  const lowerRate = Math.round(hostSetup.ratePerHour * 0.85);

  return (
    <View style={{ flex: 1 }}>
      <Screen withTabBar scroll>
        <FadeUp index={0}>
          <PageTitle eyebrow="Host Mode" title="Dashboard" />
        </FadeUp>

        <View style={{ gap: 20 }}>
          <FadeUp index={1}>
            <WeekHero
              slots={slots}
              onShare={(s) => toast.show(`${s.dayLabel} · ${s.timeLabel} shared with renters who saved you`)}
              onLowerPrice={(s) => toast.show(`${s.dayLabel} · ${s.timeLabel} now $${lowerRate}/hr`)}
            />
          </FadeUp>
          <FadeUp index={2} style={{ marginTop: 4 }}>
            <RenterRequests ref={requestsRef} toast={toast.show} />
          </FadeUp>
          <FadeUp index={3}>
            <TodaySchedule />
          </FadeUp>
          <FadeUp index={4}>
            <ListingSummary active={active} rate={hostSetup.ratePerHour} onEdit={() => setEditOpen(true)} />
          </FadeUp>
          <FadeUp index={5}>
            <StorageUtilization />
          </FadeUp>
        </View>
      </Screen>

      <EditListingSheet
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        rate={hostSetup.ratePerHour}
        description={hostSetup.description}
        active={active}
        onSave={({ rate, description, active: nextActive }) => {
          updateHostSetup({ ratePerHour: rate, description });
          setActive(nextActive);
          setEditOpen(false);
          toast.show(nextActive ? 'Listing updated' : 'Listing paused — hidden from search');
        }}
      />
      {toast.element}

      {bannerVisible && bannerRequest && (
        <RequestBanner
          request={bannerRequest}
          onApprove={() => requestsRef.current?.approve(bannerRequest.id)}
          onView={() => requestsRef.current?.open(bannerRequest.id)}
          onDismissed={() => setBannerVisible(false)}
        />
      )}
    </View>
  );
}
