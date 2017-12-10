import { presetIndex } from './presetIndex';
import { t as stubT } from './t';
import { getAreaKeys } from '../areaKeys/areaKeys';
import { omit } from '../helpers/omit';
import { keys } from '../helpers/keys';

export function presetPreset(id, preset, fields, t = stubT) {
  preset = Object.assign({}, preset);

  preset.id = id;
  preset.fields = (preset.fields || []).map(getFields);
  preset.geometry = preset.geometry || [];

  function getFields(f) {
    return fields[f];
  }

  preset.matchGeometry = function(geometry) {
    return preset.geometry.indexOf(geometry) >= 0;
  };

  preset.originalScore = preset.matchScore || 1;

  preset.matchScore = function(entityTags) {
    var tags = preset.tags,
      score = 0;

    for (var t in tags) {
      if (entityTags[t] === tags[t]) {
        score += preset.originalScore;
      } else if (tags[t] === '*' && t in entityTags) {
        score += preset.originalScore / 2;
      } else {
        return -1;
      }
    }

    return score;
  };

  preset.t = function(scope, options) {
    return t('presets.presets.' + id + '.' + scope, options);
  };

  var origName = preset.name || '';
  preset.name = function(options) {
    if (preset.suggestion) {
      id = id.split('/');
      id = id[0] + '/' + id[1];
      return origName + ' - ' + t('presets.presets.' + id + '.name', options);
    }
    return preset.t('name', Object.assign({ default: origName }, options));
  };

  var origTerms = (preset.terms || []).join();
  preset.terms = function(options) {
    return preset
      .t('terms', Object.assign({ default: origTerms }, options))
      .toLowerCase()
      .trim()
      .split(/\s*,+\s*/);
  };

  preset.isFallback = function() {
    var tagCount = keys(preset.tags).length;
    return (
      tagCount === 0 || (tagCount === 1 && preset.tags.hasOwnProperty('area'))
    );
  };

  var reference = preset.reference || {};
  preset.reference = function(geometry) {
    var key = reference.key || keys(preset.tags).filter(r => r !== 'name')[0], // da fuck ?@TOFIX
      value = reference.value || preset.tags[key];

    if (geometry === 'relation' && key === 'type') {
      if (value in preset.tags) {
        key = value;
        value = preset.tags[key];
      } else {
        return { rtype: value };
      }
    }

    if (value === '*') {
      return { key: key };
    } else {
      return { key: key, value: value };
    }
  };

  var removeTags = preset.removeTags || preset.tags || {};
  preset.removeTags = function(tags, geometry) {
    tags = omit(tags, keys(removeTags));

    for (var f in preset.fields) {
      var field = preset.fields[f];
      if (field.matchGeometry(geometry) && field.default === tags[field.key]) {
        delete tags[field.key];
      }
    }

    delete tags.area;
    return tags;
  };

  var applyTags = preset.addTags || preset.tags || {};
  preset.applyTags = function(tags, geometry) {
    var k;
    tags = Object.assign({}, tags);

    for (k in applyTags) {
      if (applyTags[k] === '*') {
        tags[k] = 'yes';
      } else {
        tags[k] = applyTags[k];
      }
    }

    // Add area=yes if necessary.
    // This is necessary if the geometry is already an area (e.g. user drew an area) AND any of:
    // 1. chosen preset could be either an area or a line (`barrier=city_wall`)
    // 2. chosen preset doesn't have a key in areaKeys (`railway=station`)
    if (!applyTags.hasOwnProperty('area')) {
      delete tags.area;
      if (geometry === 'area') {
        var needsAreaTag = true;
        if (preset.geometry.indexOf('line') === -1) {
          for (k in applyTags) {
            if (k in getAreaKeys()) {
              needsAreaTag = false;
              break;
            }
          }
        }
        if (needsAreaTag) {
          tags.area = 'yes';
        }
      }
    }

    for (var f in preset.fields) {
      var field = preset.fields[f];
      if (
        field.matchGeometry(geometry) &&
        field.key &&
        !tags[field.key] &&
        field.default
      ) {
        tags[field.key] = field.default;
      }
    }

    return tags;
  };

  return preset;
}
