module.exports = {
  canModerate(actor, target) {
    if (!actor || !target) return false;
    if (actor.id === target.id) return false;
    if (actor.guild.ownerId === actor.id) return true;
    const a = actor.roles.highest?.position ?? 0;
    const t = target.roles.highest?.position ?? 0;
    return a > t;
  }
};
