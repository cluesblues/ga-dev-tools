// Copyright 2016 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import ValidateEvent from "./ValidateEvent";
import EditEvent from "./EditEvent";
import EditUserProperties from "./EditUserProperties";
import ReduxManagedInput from "./ReduxManagedInput";
import { ReduxManagedCheckbox } from "./ReduxManagedInput";
import APISecret from "./APISecret";
import actions from "../actions";
import { State, MPEvent, MPEventType } from "../types";
import { useDispatch, useSelector } from "react-redux";
import { MPEventCategory } from "../types/events";
import Icon from "../../components/icon";

const HitBuilder: React.FC = () => {
  // TODO - The event picker should probably let you do a search to filter the dropdown.
  // TODO - make sure to focus on any new params.
  const {
    event,
    clientId,
    userId,
    measurementId,
    firebaseAppId,
    appInstanceId,
    timestampMicros,
    nonPersonalizedAds,
  } = useSelector<State, State>((a) => a);
  const dispatch = useDispatch();
  const [category, setCategory] = React.useState<MPEventCategory>(
    event.getCategories()[0]
  );

  const updateEvent = React.useCallback(
    (event: MPEvent) => {
      dispatch(actions.setEvent(event));
    },
    [dispatch]
  );

  React.useEffect(() => {
    // If the new category doesn't have the current eventType as an option,
    // update it to an empty one.
    const categoryHasEvent =
      event.getCategories().find((c) => c === category) !== undefined;
    if (!categoryHasEvent) {
      const firstEventFromNewCategory = MPEvent.eventTypes(category)[0];
      updateEvent(MPEvent.empty(firstEventFromNewCategory));
    }
  }, [category, event]);

  const updateClientId = React.useCallback(
    (clientId: string) => {
      dispatch(actions.setClientId(clientId));
    },
    [dispatch]
  );
  const updateAppInstanceId = React.useCallback(
    (appInstanceId: string) => {
      dispatch(actions.setAppInstanceId(appInstanceId));
    },
    [dispatch]
  );
  const updateUserId = React.useCallback(
    (userId: string) => {
      dispatch(actions.setUserId(userId));
    },
    [dispatch]
  );
  const updateMeasurementId = React.useCallback(
    (measurementId: string) => {
      dispatch(actions.setMeasurementId(measurementId));
    },
    [dispatch]
  );
  const updateFirebaseAppId = React.useCallback(
    (firebaseAppId: string) => {
      dispatch(actions.setFirebaseAppId(firebaseAppId));
    },
    [dispatch]
  );
  const updateTimestampMicros = React.useCallback(
    (timestampMicros: string) => {
      try {
        const asNumber = parseInt(timestampMicros, 10);
        if (isNaN(asNumber)) {
          dispatch(actions.setTimestampMicros(null));
          return;
        }
        dispatch(actions.setTimestampMicros(asNumber));
      } catch (e) {
        console.error(e);
      }
    },
    [dispatch]
  );
  const updateNonPersonalizedAds = React.useCallback(
    (nonPersonalizedAds: boolean) => {
      dispatch(actions.setNonPersonalizedAds(nonPersonalizedAds));
    },
    [dispatch]
  );

  const updateCustomEventName = React.useCallback(
    (name) => {
      updateEvent(event.updateName(name));
    },
    [event, updateEvent]
  );

  const eventReferenceUrl = `https://developers.google.com/analytics/devguides/collection/protocol/app-web/reference/events?tech=aw_measurement_protocol#${event.getEventName()}`;

  return (
    <div>
      <div className="HeadingGroup HeadingGroup--h3">
        <h3>Hit summary</h3>
        <p>The box below displays the full event and its validation status.</p>
      </div>

      <ValidateEvent />

      <div className="HitBuilderParams">
        <div className="HeadingGroup HeadingGroup--h3">
          <APISecret />
          <div className="HitBuilderParam">
            <ReduxManagedInput
              disabled={measurementId !== "" || clientId !== ""}
              labelText="firebase_app_id"
              update={updateFirebaseAppId}
              initialValue={firebaseAppId}
            />
            <ReduxManagedInput
              disabled={firebaseAppId !== "" || appInstanceId !== ""}
              labelText="measurement_id"
              update={updateMeasurementId}
              initialValue={measurementId}
            />
          </div>
          <div className="HitBuilderParam">
            <ReduxManagedInput
              disabled={measurementId !== "" || clientId !== ""}
              labelText="app_instance_id"
              update={updateAppInstanceId}
              initialValue={appInstanceId}
            />
            <ReduxManagedInput
              disabled={firebaseAppId !== "" || appInstanceId !== ""}
              labelText="client_id"
              update={updateClientId}
              initialValue={clientId}
            />
          </div>
          <ReduxManagedInput
            labelText="user_id"
            update={updateUserId}
            initialValue={userId}
          />
          <div className="HitBuilderParam">
            <ReduxManagedCheckbox
              labelText="non_personalized_ads"
              update={updateNonPersonalizedAds}
              value={nonPersonalizedAds}
            />
            <ReduxManagedInput
              labelText="timestamp_micros"
              update={updateTimestampMicros}
              initialValue={timestampMicros?.toString()}
            />
          </div>
          <div className="HitBuilderParam">
            <div className="HitBuilderParam">
              <label className="HitBuilderParam-label">Category</label>
              <select
                className="FormField"
                value={category}
                onChange={(e) => {
                  const newCategory: MPEventCategory = e.target
                    .value as MPEventCategory;
                  setCategory(newCategory);
                }}
              >
                {MPEvent.categories().map((option) => (
                  <option value={option} key={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            {category !== MPEventCategory.Custom && (
              <div className="HitBuilderParam">
                <label className="HitBuilderParam-label">Name</label>
                <select
                  className="FormField"
                  value={event.getEventType()}
                  onChange={(e) => {
                    const newEventType: MPEventType = e.target
                      .value as MPEventType;
                    const newEvent = MPEvent.empty(newEventType);
                    dispatch(actions.setEvent(newEvent));
                  }}
                >
                  {MPEvent.eventTypes(category).map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <a
                  href={eventReferenceUrl}
                  title={`Learn more about this event`}
                  className="HitBuilderParam-helpIcon-aw"
                >
                  <Icon type="info-outline" />
                </a>
              </div>
            )}
            {event.isCustomEvent() && (
              <ReduxManagedInput
                flex="0 0 4em"
                labelText="Name"
                update={updateCustomEventName}
                initialValue={event.getEventName()}
              />
            )}
          </div>
          <EditEvent event={event} updateEvent={updateEvent} />
          <EditUserProperties />
        </div>
      </div>
    </div>
  );
};

export default HitBuilder;
