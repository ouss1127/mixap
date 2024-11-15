import React, { ReactNode } from 'react';

/** @jsxImportSource @emotion/react */
// import { css } from '@emotion/react';

import { MkUpload3f } from '../markerUpload/MkUpload';
import { AuraPlay } from '../editor/AuraPlay';
import { AuraMake } from '../editor/AuraMake';
import { ActivityType } from './ActivityType';
import { MarkerPreview } from '../markerUpload/MarkerPreview';
import { MarkerCustom } from '../markerUpload/MarkerCustom'; // 
import { AuraSelect } from '../editor/AuraSelect';
import { ActivityDocType } from '../../db/types';
import { AuraPath } from '../editor/AuraPath';
import { ActivityView } from './ActivityView';

import { useTranslation } from 'react-i18next';
import { Lasso } from '../editor/Lasso';
import { Card } from 'antd';
import { to } from 'react-spring';

/*
 'meta' is an object to store meta information
  about an activity and its auras, used for AuraMake and AuraPlay.

  Currently, we store in an aura
    - @auraKey: string: default to undefined.
                 Show auras with 'auraKey'.

  We also configure for an activity
  - @timer: number: default to null, set a timer for anchoring (a countdown)

  - @strictMode: boolean: default to false, show auras only when all markers
                 are detected/present in ARView. Otherwise, show auras if any
                 marker of the activity is detected/present
  - @maxTrack: number, default to 1, how many markers, we aim to detect simultaneously,
**/

interface Step {
  title: string;
  description?: string;
  content: ReactNode;
  useCanvas?: boolean;
  useTools?: boolean;
  useMarkerCompiler?: boolean;
  isValidStep?: boolean;
  meta?: Record<string, unknown>;
}

export function activitySteps({
  id,
  type,
  activity,
  onMkUpload,
  compiling,
  markerImages,
  markerImagesCfg,
  canvasRef,
  auraPlayRef,
}: {
  id: string | undefined;
  type: string;
  activity: Partial<ActivityDocType>;
  compiling: boolean;
  onMkUpload: any;
  markerImages: any;
  markerImagesCfg: any;
  canvasRef: any;
  auraPlayRef: any;
}): Step[] {
  const { t } = useTranslation();

  switch (type) {
    case ActivityType.Superposition:
    case ActivityType.Path: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-selection'),
          // description: 'Ajouter votre contenu',
          useCanvas: false,
          useMarkerCompiler: false,
          isValidStep: (activity?.comboIds || []).length >= 2,
          content: (
            <>
              <AuraSelect
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-arrangement'),
          // description: 'Arranger votre parcours',
          useTools: false,
          useCanvas: false,
          content: (
            <>
              <AuraPath
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <>
              <AuraPlay
                ref={auraPlayRef}
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
      ];
    }
    case ActivityType.SmartGroup: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-selection'),
          // description: 'Ajouter votre contenu',
          useCanvas: false,
          isValidStep: (activity?.comboIds || []).length >= 2,
          content: (
            <>
              <AuraSelect
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
              meta={{ maxTrack: 2 }}
            />
          ),
        },
      ];
    }
    case ActivityType.Group: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-selection'),
          // description: 'Ajouter votre contenu',
          useCanvas: false,
          isValidStep: (activity?.comboIds || []).length >= 2,
          content: (
            <>
              <AuraSelect
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
            />
          ),
        },
      ];
    }
    case ActivityType.Augmentation: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-marker'),
          // description: 'Ajouter votre image marqueur',
          useMarkerCompiler: true,
          content: (
            <MkUpload3f
              activity={activity}
              multiple={false}
              onChange={onMkUpload}
              compiling={compiling}
              markerImages={markerImages}
            />
          ),
        },
        {
          title: t('common.step-augmentation'),
          // description: 'Ajouter vos augmentations',
          content: (
            <>
              {/* marker preview */}
              <MarkerPreview
                aspect={true}
                markerImages={markerImages}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />

              {/* Auras board */}
              <AuraMake
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
            />
          ),
        },
      ];
    }
    case ActivityType.Validation: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-marker'),
          // description: 'Ajouter votre image marqueur',
          useMarkerCompiler: true,
          content: (
            <MkUpload3f
              activity={activity}
              multiple={false}
              onChange={onMkUpload}
              compiling={compiling}
              markerImages={markerImages}
            />
          ),
        },
        {
          title: t('common.step-success'),
          // description: 'Ajouter vos augmentations',
          content: (
            <>
              {/* marker preview */}
              <MarkerPreview
                aspect={true}
                markerImages={markerImages}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />

              {/* Auras board */}
              <AuraMake
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-failure'),
          // description: 'Ajouter vos augmentations',
          meta: { auraKey: 'missedValidation' },
          content: (
            <>
              {/* marker preview */}
              <MarkerPreview
                aspect={true}
                cross={true}
                markerImages={markerImages}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />

              {/* Auras board */}
              <AuraMake
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
                meta={{
                  auraKey: 'missedValidation',
                }}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
              meta={{
                timer: 15,
                includesNonAnchoring: {
                  enabled: true,
                  auraKey: 'missedValidation',
                },
              }}
            />
          ),
        },
      ];
    }
    case ActivityType.Association: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-marker'),
          // description: 'Ajouter votre image marqueur',
          useMarkerCompiler: true,
          content: (
            <MkUpload3f
              activity={activity}
              multiple={true}
              maxCount={2}
              onChange={onMkUpload}
              compiling={compiling}
              markerImagesCfg={markerImagesCfg}
              markerImages={markerImages}
            />
          ),
        },
        {
          title: t('common.step-augmentation'),
          // description: 'Ajouter vos augmentations',
          content: (
            <>
              {/* marker preview */}
              <MarkerPreview
                aspect={true}
                markerImages={markerImages}
                markerImagesCfg={markerImagesCfg}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />

              {/* Auras board */}
              <AuraMake
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
              meta={{ strictMode: true, maxTrack: 2 }}
            />
          ),
        },
      ];
    }
    // 
    case ActivityType.Customization: {
      return [
        {
          title: t('common.step-naming'),
          // description: 'Nommer votre activité',
          useCanvas: false,
          content: (
            <>
              <ActivityView
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-marker'),
          // description: 'Ajouter votre image marqueur',
          useMarkerCompiler: true,
          content: (
            <MkUpload3f
              activity={activity}
              multiple={false}
              onChange={onMkUpload}
              compiling={compiling}
              markerImages={markerImages}
            />
          ),
        },
        {
          title: t('common.step-augmentation'),
          // description: 'Customiser votre activité',
          content: (
            <>
              {/* marker preview */}
              <MarkerPreview
                aspect={true}
                markerImages={markerImages}
              />

              {/* marker Custom */}
              <MarkerCustom
                aspect={true}
                markerImages={markerImages}
                activity={activity}
                activityId={id}
              />

              {/* Auras board */}
              <AuraMake
                canvasRef={canvasRef}
                activity={activity}
                activityId={id}
              />
            </>
          ),
        },
        {
          title: t('common.step-trial'),
          // description: 'Essayer votre activité',
          content: (
            <AuraPlay
              ref={auraPlayRef}
              canvasRef={canvasRef}
              activity={activity}
              activityId={id}
            />
          ),
        },
      ];
    }

    default:
      return [];
  }
}
function useState(arg0: string): [any, any] {
  throw new Error('Function not implemented.');
}
