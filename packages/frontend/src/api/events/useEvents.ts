/*
    NOTE:
    I implemented it like this mostly to showcase some useStates/useEffects usages.
    For simplicity is always fetches all events (without pagination).
    In a bigger application I probably would use something like 'react-quey' or 'zustand'
    or 'useContextSelector' to handle caching, data sharing across multiple components, query
    invalidation and so on. 'react-query' even has a nice built-in integration with <Suspense/>
    that makes adding loading states and error states a bit easier (errors would be captured by <ErrorBoundary/>).
*/

import { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { ICreateEventDto, IEventId, IEventsArrayDto, IUpdateEventDto } from "@project/globals";

import { createEvent, deleteEvent, getAllEvents, updateEvent } from "./eventsEndpoints";
import { IGenericApiResponseDto } from "../ApiClient";

export const useEvents = () => {
  /*
    NOTE:
    Once fetching is done 'isFetching' and 'events' state will be modified in the same async call.
    React 17 won't batch state updates it will re-render component one time more than it should.
    I could fix it by using one object state, but React 18 handles batching so in the future there
    won't be need for that and this approach makes code easier to read.
  */
  const [isFetching, setIsFetching] = useState(true);
  const [events, setEvents] = useState<IEventsArrayDto>([]);
  const [error, setError] = useState<string | null>(null);

  const latestEventsResponsePromiseRef = useRef<Promise<
    IGenericApiResponseDto<IEventsArrayDto>
  > | null>(null);

  /* -------------------------------- FETCHING -------------------------------- */

  const refreshEvents = useCallback(async () => {
    setIsFetching(true);
    setError(null);

    const thisEventsResponsePromise = getAllEvents();
    latestEventsResponsePromiseRef.current = thisEventsResponsePromise;

    const response = await thisEventsResponsePromise;

    /*
        NOTE:
        For preventing race conditions. Makes sure that if multiple
        calls are made, only data from the latest one will be displayed in the UI.
    */
    if (latestEventsResponsePromiseRef.current === thisEventsResponsePromise) {
      if (response.success) {
        setEvents(response.data);
      } else {
        setEvents([]);
        setError(
          `(${response.statusCode} status) ${response.error.name} : ${response.error.message}`
        );
      }

      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    // Fetch on mount
    refreshEvents();
  }, [refreshEvents]);

  /* -------------------------------- MUTATIONS ------------------------------- */

  const mutations = useMemo(() => {
    /*
        NOTE:
        Starts with with optimistic state updates to improve UX (something will change in the UI),
        then once mutations is done it fetches all events again to make sure that data in
        the frontend and in the backend matches.
        
        It could only take response and fix the id (since backend may generate
        a different one) or revert state change on error, but fetching
        everything again (or at least a single page if pagination is used) seems more
        bulletproof especially in cases where multiple users work on something together.
        Of course in that case, some additional pooling or websocket events
        would be used to detect these changes.

        For collaboration there are also other cool tools like 'automerge'
        that could be used instead of refreshing page contents.
    */

    const withApiResultHandler = <ArgsType extends Array<unknown>, K>(
      apiCall: (...v: ArgsType) => Promise<IGenericApiResponseDto<K>>
    ) => {
      return async (...args: ArgsType): Promise<IGenericApiResponseDto<K>> => {
        const result = await apiCall(...args);
        refreshEvents();

        if (!result.success) {
          /*
            NOTE:
            In a big app there could be a toasts notifications system or something.
            Callback promise also could be used to display a warning in the UI.
          */
          if (process.env.NODE_ENV !== "test") {
            console.error(result);
            alert("Mutation failed, details in the console.");
          }
        }

        return result;
      };
    };

    return {
      createEvent: withApiResultHandler(async (newEventWithoutId: ICreateEventDto) => {
        setEvents((events) => {
          const lastEventId = events[events.length - 1]?.id || 0;
          return [...events, { ...newEventWithoutId, id: lastEventId + 1 }];
        });

        return await createEvent(newEventWithoutId);
      }),

      updateEvent: withApiResultHandler(async (id: IEventId, eventChanges: IUpdateEventDto) => {
        setEvents((events) => {
          return events.map((event) => {
            if (event.id === id) {
              return { ...event, ...eventChanges };
            } else {
              return event;
            }
          });
        });

        return await updateEvent(id, eventChanges);
      }),

      deleteEvent: withApiResultHandler(async (id: IEventId) => {
        setEvents((events) => {
          return events.filter((event) => event.id !== id);
        });

        return await deleteEvent(id);
      }),
    };
  }, [refreshEvents]);

  return {
    isFetching,
    events,
    error,
    ...mutations,
  };
};
