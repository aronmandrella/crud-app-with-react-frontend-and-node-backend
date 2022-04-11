import styles from "./EventsTable.module.scss";

import React from "react";
import clsx from "clsx";

import { IEventDto, IEventId, IEventsArrayDto, IUpdateEventDto } from "@project/globals";
import { ErrorBox, Spinner, Icon } from "@ui";

/* -------------------------------------------------------------------------- */
/*                               HELPER FOR DEMO                              */
/* -------------------------------------------------------------------------- */

/*
  Little placeholder information for the UI.
*/
let showedAboutRandomizedUpdateAlert = false;

const showAboutRandomizedUpdateAlert = () => {
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
};

const makeRandomString = (length: number): string =>
  Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .slice(0, length);

/* -------------------------------------------------------------------------- */
/*                                ROW COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface IEventsTableRowProps extends IEventDto {
  onDeleteEvent: (id: IEventId) => void;
  onUpdateEvent: (id: IEventId, changes: IUpdateEventDto) => void;
}

/*
  NOTE:
  Extracting rows makes sense when React.memo is used. React will be able to detect
  which rows have changed, and it won't have to render every row again if some other
  row is updated, deleted or added.

  This could be in a separate file if it had some more logic.
*/
export const EventsTableRow: React.VFC<IEventsTableRowProps> = React.memo((props) => {
  const { id, date, email, firstName, lastName, onDeleteEvent, onUpdateEvent } = props;

  /*
    NOTE:
    Buttons are not some complex components so I don't see any reasons
    to use useCallback here. I left it like this since it's more readable.
  */
  const handleDelete = () => {
    onDeleteEvent(id);
  };

  const handleUpdate = () => {
    showAboutRandomizedUpdateAlert();

    onUpdateEvent(id, {
      firstName: makeRandomString(8),
      lastName: makeRandomString(8),
      email: `${makeRandomString(8)}@${makeRandomString(8)}.com`,
      date: new Date(Math.random() * 10000000000000).toISOString(),
    });
  };

  return (
    <tr>
      <td>{id}</td>
      <td>{firstName}</td>
      <td>{lastName}</td>
      <td>{email}</td>
      <td>{date}</td>
      <td className={styles.actionButtonsCell}>
        <button className={styles.actionButton} onClick={handleDelete}>
          <Icon.Trash />
        </button>
        <button className={styles.actionButton} onClick={handleUpdate}>
          <Icon.Pencil />
        </button>
      </td>
    </tr>
  );
});

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

interface IEventsTableProps {
  className?: string;
  isFetching: boolean;
  events: IEventsArrayDto;
  error: string | null;
  onDeleteEvent: (id: IEventId) => void;
  onUpdateEvent: (id: IEventId, changes: IUpdateEventDto) => void;
}

export const EventsTable: React.VFC<IEventsTableProps> = React.memo((props) => {
  const { className, isFetching, events, error, onDeleteEvent, onUpdateEvent } = props;

  let overlayContentJsx: React.ReactNode | undefined;

  if (isFetching && events.length === 0) {
    overlayContentJsx = <Spinner size={60} />;
  } else if (error) {
    overlayContentJsx = <ErrorBox title="Failed to fetch events data" message={error} />;
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
