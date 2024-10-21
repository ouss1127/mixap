import Augmentation from '../../assets/annoter.png';
import Validation from '../../assets/valider.png';
import Association from '../../assets/associer.png';
import Group from '../../assets/ensemble.png';
import SmartGroup from '../../assets/ensemble.png';
import Path from '../../assets/parcours.png';
import Superposition from '../../assets/superposer.png';
import Customization from '../../assets/genai.png';

export enum ActivityType {
  Augmenter = 'Augmenter',
  Augmentation = 'Augmentation',
  Validation = 'Validation',
  Association = 'Assocation',
  Superposition = 'Superposition',
  Group = 'Group',
  SmartGroup = 'SmartGroup',
  Path = 'Path',
  Customization = 'Customization',
}

export const activityTypeList = {
  [ActivityType.Augmentation]: {
    title: 'common.augmentation-title',
    description: 'common.augmentation-description',
    cover: Augmentation,
    type: ActivityType.Augmentation,
    placeholders: {
      title: 'common.augmentation-placeholder-title',
      instruction: 'common.augmentation-placeholder-instruction',
      description: 'common.augmentation-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Validation]: {
    title: 'common.validation-title',
    description: 'common.validation-description',
    cover: Validation,
    type: ActivityType.Validation,
    placeholders: {
      title: 'common.validation-placeholder-title',
      instruction: 'common.validation-placeholder-instruction',
      description: 'common.validation-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Association]: {
    title: 'common.association-title',
    description: 'common.association-description',
    cover: Association,
    type: ActivityType.Association,
    placeholders: {
      title: 'common.association-placeholder-title',
      instruction: 'common.association-placeholder-instruction',
      description: 'common.association-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Superposition]: {
    title: 'common.superposition-title',
    description: 'common.superposition-description',
    cover: Superposition,
    type: ActivityType.Superposition,
    placeholders: {
      title: 'common.superposition-placeholder-title',
      instruction: 'common.superposition-placeholder-instruction',
      description: 'common.superposition-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Group]: {
    title: 'common.group-title',
    description: 'common.group-description',
    cover: Group,
    type: ActivityType.Group,
    placeholders: {
      title: 'common.group-placeholder-title',
      instruction: 'common.group-placeholder-instruction',
      description: 'common.group-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.SmartGroup]: {
    title: 'common.smartGroup-title',
    description: 'common.smartGroup-description',
    cover: SmartGroup,
    type: ActivityType.SmartGroup,
    placeholders: {
      title: 'common.smartGroup-placeholder-title',
      instruction: 'common.smartGroup-placeholder-instruction',
      description: 'common.smartGroup-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Path]: {
    title: 'common.path-title',
    description: 'common.path-description',
    cover: Path,
    type: ActivityType.Path,
    placeholders: {
      title: 'common.path-placeholder-title',
      instruction: 'common.path-placeholder-instruction',
      description: 'common.path-placeholder-description',
    },
    disabled: false,
  },
  [ActivityType.Customization]: {
    title: 'common.customization-title',
    description: 'common.customization-description',
    cover: Customization,
    type: ActivityType.Customization,
    placeholders: {
      title: 'common.customization-placeholder-title',
      instruction: 'common.customization-placeholder-instruction',
      description: 'common.customization-placeholder-description',
    },
    disabled: false,
  },
};

export const AurasDefaults = {
  [ActivityType.Validation]: [
    {
      type: 'AText',
      content: {
        value: 'common.default-aura-validation-failure',
      },
      cfg: {
        style: {
          fontFamily: 'Roboto',
          fontSize: 24,
          color: '#000000',
          background: '#fcb900',
          textAlign: 'left',
          fontVariant: 'normal',
          fontStyle: 'normal',
          fontWeight: 'normal',
          guesture: 'holder',
        },
        width: 161,
        height: 92,
        position: [-0.09995470397567562, -0.5640645886871292, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      },
      meta: {
        auraKey: 'missedValidation',
      },
    },
    {
      type: 'AText',
      content: {
        value: 'common.default-aura-validation-success',
      },
      cfg: {
        style: {
          fontFamily: 'Roboto',
          fontSize: 45,
          color: '#000',
          background: '#00d084',
          textAlign: 'left',
          fontVariant: 'normal',
          fontStyle: 'normal',
          fontWeight: 'normal',
          guesture: 'holder',
        },
        width: 172,
        height: 104,
        position: [0.23516661992549043, 0.762221296619593, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      },
      meta: {},
    },
  ],
  [ActivityType.Association]: [
    {
      type: 'AText',
      content: {
        value: 'common.default-aura-association',
      },
      cfg: {
        style: {
          fontFamily: 'Roboto',
          fontSize: 24,
          color: '#000',
          background: '#8ed1fc',
          textAlign: 'left',
          fontVariant: 'normal',
          fontStyle: 'normal',
          fontWeight: 'normal',
          guesture: 'holder',
        },
        width: 182,
        height: 105,
        position: [-0.02791619305445172, 1.1658757314042085, 0],
        scale: [1, 1, 1],
        rotation: [0, 0, 0],
      },
    },
  ],
};
