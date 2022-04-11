import styles from "./App.module.scss";

import React from "react";
import clsx from "clsx";

import { useEvents } from "@api";
import { EventsMaker } from "../EventsMaker";
import { EventsTable } from "../EventsTable";

/* -------------------------------------------------------------------------- */
/*                       HELPER <AppSection/> COMPONENT                       */
/* -------------------------------------------------------------------------- */

interface IAppSectionProps {
  className?: string;
  header: string;
  children: React.ReactNode;
}

const AppSection: React.VFC<IAppSectionProps> = (props) => {
  const { className, header, children } = props;

  return (
    <section className={clsx(className, styles.appSection)}>
      <h2 className={styles.appSectionHeader}>{header}</h2>
      {children}
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export const App: React.VFC = React.memo(() => {
  const { isFetching, events, error, createEvent, deleteEvent, updateEvent } = useEvents();

  return (
    <div className={styles.app}>
      <header className={styles.appBar}>
        <h1 className={styles.appBarLogo}>CRUD Events</h1>
        <p className={styles.appBarHeader}>
          Basic CRUD app with React frontend and Node.js backend
        </p>
      </header>

      <main className={styles.appContent}>
        <AppSection className={styles.createEventSection} header="Add new event">
          <EventsMaker onCreateEvent={createEvent} />
        </AppSection>

        <AppSection className={styles.viewEventsSection} header="Existing events">
          <EventsTable
            isFetching={isFetching}
            events={events}
            error={error}
            onDeleteEvent={deleteEvent}
            onUpdateEvent={updateEvent}
          />
        </AppSection>
      </main>
    </div>
  );
});
