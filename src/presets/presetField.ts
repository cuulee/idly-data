import { t as stubT } from './t';

export function presetField(id, field, t = stubT) {
  field = Object.assign({}, field);

  field.id = id;

  field.matchGeometry = function(geometry) {
    return !field.geometry || field.geometry === geometry;
  };

  field.t = function(scope, options) {
    return t('presets.fields.' + id + '.' + scope, options);
  };

  field.label = function(options: any) {
    return field.t('label', Object.assign({ default: id }, options));
  };

  var placeholder = field.placeholder;
  field.placeholder = function(options: any) {
    return field.t(
      'placeholder',
      Object.assign({ default: placeholder }, options)
    );
  };

  return field;
}
