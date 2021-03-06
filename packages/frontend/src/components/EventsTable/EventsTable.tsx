import styles from "./EventsTable.module.scss";

import React from "react";
import clsx from "clsx";

import {
  IEventDto,
  IEventId,
  IEventsArrayDto,
  IUpdateEventDto,
  ICreateEventDto,
} from "@project/globals";
import { ErrorBox, Spinner, Icon } from "@ui";
import { makeRandomString } from "@helpers";

/* -------------------------------------------------------------------------- */
/*                               HELPER FOR DEMO                              */
/* -------------------------------------------------------------------------- */

/*
  Little placeholder information for the UI.
*/
let showedAboutRandomizedUpdateAlert = false;

const showAboutRandomizedUpdateAlert = () => {
  if (process.env.NODE_ENV !== "test") {
    if (!showedAboutRandomizedUpdateAlert) {
      alert(
        [
          `NOTE:`,
          `Updates could be handled inside table with inline inputs and debounce.`,
          `I could also open a modal that allows editing or pass this data to part of the app where events are created.`,
          `I dint't want to add to much stuff to this little demo app, so update will just randomize the event.`,
        ].join("\n\n")
      );

      showedAboutRandomizedUpdateAlert = true;
    }
  }
};

export const createRandomCreateEventDto = (): ICreateEventDto => {
  return {
    firstName: makeRandomString(8),
    lastName: makeRandomString(8),
    email: `${makeRandomString(8)}@${makeRandomString(8)}.com`,
    date: new Date(Math.random() * 10000000000000).toISOString(),
  };
};

/* -------------------------------------------------------------------------- */
/*                                ROW COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface IEventsTableRowProps extends IEventDto {
  onDeleteEvent?: (id: IEventId) => void;
  onUpdateEvent?: (id: IEventId, changes: IUpdateEventDto) => void;
}

/*
  NOTE:
  Extracting rows makes sense when React.memo is used. React will be able to detect
  which rows have changed, and it won't have to render every row again if some other
  row is updated, deleted or added.

  I would save it in a separate file if it had more logic.
*/
export const EventsTableRow: React.VFC<IEventsTableRowProps> = React.memo((props) => {
  const { id, date, email, firstName, lastName, onDeleteEvent, onUpdateEvent } = props;

  /*
    NOTE:
    <button>s are not some complex components so I don't see any reasons
    to use useCallback here. I left it like this since it's more readable.
  */
  const handleDelete = () => {
    if (onDeleteEvent) {
      onDeleteEvent(id);
    }
  };

  const handleUpdate = () => {
    if (onUpdateEvent) {
      showAboutRandomizedUpdateAlert();

      onUpdateEvent(id, createRandomCreateEventDto());
    }
  };

  return (
    <tr data-eventid={id}>
      <td>{id}</td>
      <td>{firstName}</td>
      <td>{lastName}</td>
      <td>{email}</td>
      <td>{date}</td>
      <td className={styles.actionButtonsCell}>
        <button aria-label="delete" className={styles.actionButton} onClick={handleDelete}>
          <Icon.Trash />
        </button>
        <button aria-label="update" className={styles.actionButton} onClick={handleUpdate}>
          <Icon.Pencil />
        </button>
      </td>
    </tr>
  );
});

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

/* 
  NOTE:
  Messages exported for tests.
  If application was localized, test would probably use data
  from a json or some external provider in both places.
*/
export const ERROR_TITLE = "Failed to fetch events data";
export interface IEventsTableProps {
  className?: string;
  isFetching?: boolean;
  events: IEventsArrayDto;
  error?: string | null;
  onDeleteEvent?: (id: IEventId) => void;
  onUpdateEvent?: (id: IEventId, changes: IUpdateEventDto) => void;
}

export const EventsTable: React.VFC<IEventsTableProps> = React.memo((props) => {
  const { className, isFetching = false, events, error, onDeleteEvent, onUpdateEvent } = props;

  let overlayContentJsx: React.ReactNode | undefined;

  if (isFetching && events.length === 0) {
    overlayContentJsx = <Spinner size={60} />;
  } else if (error) {
    overlayContentJsx = <ErrorBox title={ERROR_TITLE} message={error} />;
  }

  return (
    <div className={clsx(className, styles.root)}>
      {overlayContentJsx && <div className={styles.overlay}>{overlayContentJsx}</div>}

      {/*
        NOTE:
        Big application probably would have a reusable table component
        that would accept an object with data and object with columns properties.
      */}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>First Name</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            return (
              <EventsTableRow
                key={event.id}
                {...event}
                onDeleteEvent={onDeleteEvent}
                onUpdateEvent={onUpdateEvent}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
