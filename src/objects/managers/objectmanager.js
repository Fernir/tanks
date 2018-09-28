export default class ObjectManager {
  globalGuid = 0;
  objects = [];

  init = () => {};

  add = (obj) => {
    obj.guid = this.globalGuid;
    this.objects.push(obj);
    this.globalGuid++;
  };

  calculate = () => this.objects.forEach((o) => o.calculate());

  draw = () => this.objects.forEach((o) => o.draw());
}
