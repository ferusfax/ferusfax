#! /usr/bin/env node

import FerusfaxController from './controller';

(async () => {
  const controller = new FerusfaxController();
  controller.run();
})();
